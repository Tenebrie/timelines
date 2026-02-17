import { CalendarUnit } from '@api/types/calendarTypes'
import { WorldCalendar, WorldCalendarUnit } from '@api/types/worldTypes'

import { ParsedTimestamp } from './types'
import { formatTimestampUnits } from './utils/formatTimestampUnits'
import { parseTimestampMultiRoot } from './utils/parseTimestampMultiRoot'

export class EsotericDate {
	private calendar: WorldCalendar
	private timestamp: number
	private unitById: Map<string, CalendarUnit>
	private _parsedCache: ParsedTimestamp | null = null

	constructor(calendar: WorldCalendar, timestamp: number)
	constructor(date: EsotericDate)
	constructor(calendarOrDate: WorldCalendar | EsotericDate, timestamp?: number) {
		if (calendarOrDate instanceof EsotericDate) {
			this.calendar = calendarOrDate.calendar
			this.timestamp = calendarOrDate.timestamp
			this.unitById = calendarOrDate.unitById
			this._parsedCache = calendarOrDate._parsedCache
		} else {
			this.calendar = calendarOrDate
			this.timestamp = timestamp!
			this.unitById = new Map(calendarOrDate.units.map((u) => [u.id, u]))
		}
	}

	private parse(): ParsedTimestamp {
		return (this._parsedCache ??= parseTimestampMultiRoot({
			allUnits: this.calendar.units,
			timestamp: this.timestamp + this.originTime,
		}))
	}

	getTimestamp() {
		return this.timestamp
	}

	format(formatString: string) {
		return formatTimestampUnits(this.calendar.units, this.parse(), formatString)
	}

	getBucketId(unit: CalendarUnit) {
		return this.parse()
			.values()
			.find((entry) => entry.unit.displayName?.toLowerCase() === unit.displayName.toLowerCase())?.unit.id
	}

	get(unit: WorldCalendarUnit) {
		const parsed = this.parse()
		const bucketId = parsed
			.values()
			.find((entry) => entry.unit.displayName?.toLowerCase() === unit.displayName.toLowerCase())?.unit.id
		if (!bucketId) {
			throw new Error('No bucketId match for unit ' + unit.name)
		}
		return parsed.get(bucketId)
	}

	getDuration(unit: CalendarUnit) {
		return this.parse().get(unit.id)?.unit.duration ?? 0
	}

	private get originTime(): number {
		return this.calendar.originTime
	}

	step(unit: WorldCalendarUnit, amount: number = 1): EsotericDate {
		if (amount === 0) {
			return new EsotericDate(this.calendar, this.timestamp)
		}

		const parsed = this.parse()

		// Find the target unit's entry via bucket matching (displayName)
		const targetBucket = unit.displayName.toLowerCase()
		const targetEntry = [...parsed.values()].find(
			(entry) => (entry.unit.displayName ?? entry.unit.name).toLowerCase() === targetBucket,
		)
		if (!targetEntry) {
			throw new Error('No bucket match for unit ' + unit.name)
		}

		const matchedUnit = this.unitById.get(targetEntry.unit.id)
		if (!matchedUnit) {
			throw new Error('Matched unit not found in calendar units: ' + targetEntry.unit.id)
		}

		// Resolve the child offset to preserve ONCE from the original timestamp,
		// then step on the floored timestamp (which has no sub-unit offset to confuse recursion).
		const floored = this.floor(unit)
		const stepped = floored.stepFloored(unit, amount)

		// Find the actual unit at the destination. The stepped position may be on a different
		// concrete unit type (e.g. NormalYear vs LeapYear, or WorkHour vs BreakSlot).
		// resolvePreservedChildren correctly handles child loss when the new unit lacks a child bucket.
		const destUnit = stepped.resolveActualUnit(matchedUnit)

		// Collect the original child values and resolve them in the destination unit's structure
		const childValues = this.collectDescendantValues(parsed, matchedUnit)
		const newChildOffset = this.resolveChildOffset(destUnit, childValues)

		return new EsotericDate(this.calendar, stepped.timestamp + newChildOffset)
	}

	/**
	 * Internal step that assumes `this` is already floored to the target unit.
	 * All recursion happens on floored positions, so there are no children to
	 * preserve or double-count. Child preservation is handled by the public step().
	 */
	private stepFloored(unit: WorldCalendarUnit, amount: number): EsotericDate {
		if (amount === 0) {
			return new EsotericDate(this.calendar, this.timestamp)
		}

		const allUnits = this.calendar.units
		const parsed = this.parse()

		// Find the target unit's entry via bucket matching (displayName)
		const targetBucket = unit.displayName.toLowerCase()
		const targetEntry = [...parsed.values()].find(
			(entry) => (entry.unit.displayName ?? entry.unit.name).toLowerCase() === targetBucket,
		)
		if (!targetEntry) {
			throw new Error('No bucket match for unit ' + unit.name)
		}

		const matchedUnit = this.unitById.get(targetEntry.unit.id)
		if (!matchedUnit) {
			throw new Error('Matched unit not found in calendar units: ' + targetEntry.unit.id)
		}

		// Bulk skip using the root cycle. The root cycle has a fixed duration that
		// doesn't depend on position, so skipping N root cycles is always safe.
		// This prevents O(amount) recursion for large steps.
		const findRoot = (u: CalendarUnit): CalendarUnit => {
			if (u.parents.length === 0) return u
			const parentUnits = u.parents
				.map((rel) => this.unitById.get(rel.parentUnitId))
				.filter((p): p is CalendarUnit => !!p)
			if (parentUnits.length === 0) return u
			return findRoot(parentUnits.reduce((a, b) => (Number(a.duration) > Number(b.duration) ? a : b)))
		}
		const root = findRoot(matchedUnit)
		// Only use root-cycle bulk skip when the root is NOT the immediate parent.
		// When the root is the immediate parent, the overflow path handles it directly
		// with correct slot-level arithmetic (which may differ from target-bucket counting
		// when there are mixed non-hidden sibling types).
		const isRootImmediateParent = matchedUnit.parents.some((rel) => rel.parentUnitId === root.id)
		if (root.id !== matchedUnit.id && !isRootImmediateParent) {
			const rootTargetSlots = this.countTargetSlotsInCycle(root, targetBucket)
			if (rootTargetSlots > 0) {
				const fullRootCycles = Math.trunc(amount / rootTargetSlots)
				if (fullRootCycles !== 0) {
					const remainder = amount - fullRootCycles * rootTargetSlots
					const newTs = this.timestamp + fullRootCycles * Number(root.duration)
					const jumped = new EsotericDate(this.calendar, newTs)
					if (remainder === 0) {
						return jumped
					}
					return jumped.stepFloored(unit, remainder)
				}
			}
		}

		// Find the parent of this unit.
		const parentInfo = this.resolveActiveParent(matchedUnit, allUnits)
		if (!parentInfo) {
			// Root unit — no parent cycle to walk. Just add amount * duration.
			return new EsotericDate(this.calendar, this.timestamp + amount * Number(matchedUnit.duration))
		}

		const { parentUnit, parentCycleStart } = parentInfo
		const parentDuration = Number(parentUnit.duration)

		// Build the flat slot list for the parent's children.
		type Slot = { unit: CalendarUnit; slotIndexInBucket: number }
		const slots: Slot[] = []
		const bucketCounters = new Map<string, number>()
		for (const childRelation of parentUnit.children) {
			const childUnit = this.unitById.get(childRelation.childUnitId)
			if (!childUnit) continue
			const bucket = childUnit.displayName.toLowerCase()
			for (let r = 0; r < childRelation.repeats; r++) {
				const idx = bucketCounters.get(bucket) ?? 0
				slots.push({ unit: childUnit, slotIndexInBucket: idx })
				bucketCounters.set(bucket, idx + 1)
			}
		}

		if (slots.length === 0) {
			return new EsotericDate(this.calendar, this.timestamp)
		}

		// Find our current slot by walking the slot list using the offset within the parent cycle.
		const offsetWithinParent = this.timestamp - parentCycleStart
		let accumulatedOffset = 0
		let currentSlotIndex = -1
		for (let i = 0; i < slots.length; i++) {
			const slotDuration = Number(slots[i].unit.duration)
			if (accumulatedOffset + slotDuration > offsetWithinParent) {
				currentSlotIndex = i
				break
			}
			accumulatedOffset += slotDuration
		}
		if (currentSlotIndex === -1) {
			currentSlotIndex = slots.length - 1
		}

		// Count how many effective steps of the target unit exist in one parent cycle.
		// For non-hidden parents, every slot is a step.
		// For hidden parents, only target-bucket slots inside them count.
		const effectiveStepsPerCycle = this.countEffectiveStepsInCycle(parentUnit, targetBucket)

		// Step forward (or backward) by amount slots
		const newSlotIndex = currentSlotIndex + amount
		const totalSlots = slots.length

		// Check if any sibling slot is a Hidden unit that contains the target unit.
		const hasHiddenSiblings = slots.some(
			(s) =>
				s.unit.formatMode === 'Hidden' &&
				s.unit.children.some((ch) => {
					const childUnit = this.unitById.get(ch.childUnitId)
					return childUnit && childUnit.displayName.toLowerCase() === targetBucket
				}),
		)

		// --- Within-cycle: step lands inside the current parent cycle ---

		if (hasHiddenSiblings) {
			// When hidden siblings exist, we can't just use slot index arithmetic.
			// Check if the step would land on a Hidden sibling.
			const wouldLandOnHiddenSibling =
				newSlotIndex >= 0 && newSlotIndex < totalSlots && slots[newSlotIndex].unit.formatMode === 'Hidden'

			if (!wouldLandOnHiddenSibling && newSlotIndex >= 0 && newSlotIndex < totalSlots) {
				// Lands cleanly on a non-hidden slot within this cycle
				let newSlotStartOffset = 0
				for (let i = 0; i < newSlotIndex; i++) {
					newSlotStartOffset += Number(slots[i].unit.duration)
				}
				return new EsotericDate(this.calendar, parentCycleStart + newSlotStartOffset)
			}

			// Step crosses a hidden sibling or overflows — advance one slot at a time
			if (amount > 0) {
				const currentSlotDuration = Number(slots[currentSlotIndex].unit.duration)
				const currentSlotStart = parentCycleStart + accumulatedOffset
				const nextSlotStart = currentSlotStart + currentSlotDuration
				const slotsConsumed = 1
				const remaining = amount - slotsConsumed
				if (remaining === 0) {
					const dateAtBoundary = new EsotericDate(this.calendar, nextSlotStart)
					return dateAtBoundary.floor(unit)
				}
				const dateAtBoundary = new EsotericDate(this.calendar, nextSlotStart)
				return dateAtBoundary.stepFloored(unit, remaining)
			} else {
				const currentSlotStart = parentCycleStart + accumulatedOffset
				const prevEnd = currentSlotStart - 1
				const slotsConsumed = 1
				const remaining = amount + slotsConsumed
				if (remaining === 0) {
					const dateAtBoundary = new EsotericDate(this.calendar, prevEnd)
					return dateAtBoundary.floor(unit)
				}
				const dateAtBoundary = new EsotericDate(this.calendar, prevEnd)
				const floored = dateAtBoundary.floor(unit)
				return floored.stepFloored(unit, remaining)
			}
		}

		// No hidden siblings — pure slot index arithmetic works
		if (newSlotIndex >= 0 && newSlotIndex < totalSlots) {
			let newSlotStartOffset = 0
			for (let i = 0; i < newSlotIndex; i++) {
				newSlotStartOffset += Number(slots[i].unit.duration)
			}
			return new EsotericDate(this.calendar, parentCycleStart + newSlotStartOffset)
		}

		// --- Overflow: step goes past the current parent cycle ---
		// Jump one parent cycle at a time because adjacent parent cycles
		// may have different durations (e.g. 100-year-cycle vs 4-year-cycle x25).
		// Use bulk skip only when we can verify same-parent-type siblings exist.

		if (effectiveStepsPerCycle > 0) {
			const slotsToEdge = amount > 0 ? totalSlots - currentSlotIndex : currentSlotIndex + 1
			const remaining = amount > 0 ? amount - slotsToEdge : amount + slotsToEdge

			if (amount > 0) {
				const nextParentStart = parentCycleStart + parentDuration
				if (remaining === 0) {
					const dateAtBoundary = new EsotericDate(this.calendar, nextParentStart)
					return dateAtBoundary.floor(unit)
				}
				const dateAtBoundary = new EsotericDate(this.calendar, nextParentStart)
				return dateAtBoundary.stepFloored(unit, remaining)
			} else {
				const prevParentEnd = parentCycleStart - 1
				const dateAtBoundary = new EsotericDate(this.calendar, prevParentEnd)
				if (remaining === 0) {
					return dateAtBoundary.floor(unit)
				}
				const flooredBoundary = dateAtBoundary.floor(unit)
				return flooredBoundary.stepFloored(unit, remaining)
			}
		}

		// Fallback: no target slots in cycle (shouldn't happen in practice)
		const parentOverflow = Math.floor(newSlotIndex / totalSlots)
		let wrappedSlotIndex = newSlotIndex % totalSlots
		if (wrappedSlotIndex < 0) {
			wrappedSlotIndex += totalSlots
		}

		let newSlotStartOffset = 0
		for (let i = 0; i < wrappedSlotIndex; i++) {
			newSlotStartOffset += Number(slots[i].unit.duration)
		}

		const newTimestamp = parentCycleStart + newSlotStartOffset + parentOverflow * parentDuration
		return new EsotericDate(this.calendar, newTimestamp)
	}

	/**
	 * Find the actual concrete unit at the current timestamp, at the same hierarchy level
	 * as the reference unit. We find the reference unit's parent, determine which parent
	 * cycle instance contains this timestamp, then walk that cycle's children to find
	 * which concrete slot (e.g. NormalYear vs LeapYear, WorkHour vs BreakSlot) we're in.
	 * Falls back to the reference unit if no parent can be resolved.
	 */
	private resolveActualUnit(referenceUnit: CalendarUnit): CalendarUnit {
		if (referenceUnit.parents.length === 0) {
			return referenceUnit
		}

		// Find the parent unit. For units with multiple parents, find the immediate parent
		// by picking the one with the smallest duration that still contains this unit.
		const parentCandidates = referenceUnit.parents
			.map((rel) => this.unitById.get(rel.parentUnitId))
			.filter((u): u is CalendarUnit => !!u)

		if (parentCandidates.length === 0) {
			return referenceUnit
		}

		// Use the immediate parent (smallest duration among parents)
		const parentUnit = parentCandidates.reduce((a, b) => (Number(a.duration) < Number(b.duration) ? a : b))

		// Find where this parent cycle starts at the current timestamp
		// Use the parent's own parent resolution to find the cycle start
		const parentDuration = Number(parentUnit.duration)
		const parentInfo = this.resolveActiveParent(parentUnit, this.calendar.units, this.timestamp)

		let parentCycleStart: number
		if (parentInfo) {
			// The parent itself has a parent — find its start within the grandparent
			const gpOffset = this.timestamp - parentInfo.parentCycleStart
			let acc = 0
			let found = false
			for (const ch of parentInfo.parentUnit.children) {
				const chUnit = this.unitById.get(ch.childUnitId)
				if (!chUnit) continue
				for (let r = 0; r < ch.repeats; r++) {
					const d = Number(chUnit.duration)
					if (acc + d > gpOffset) {
						parentCycleStart = parentInfo.parentCycleStart + acc
						found = true
						break
					}
					acc += d
				}
				if (found) break
			}
			if (!found) {
				return referenceUnit
			}
		} else {
			// Parent is root — cycle aligned to absolute 0
			const absTs = this.timestamp + this.originTime
			parentCycleStart = Math.floor(absTs / parentDuration) * parentDuration - this.originTime
		}

		// Walk children of the parent to find which slot contains this timestamp
		const offsetWithinParent = this.timestamp - parentCycleStart!
		let accumulatedOffset = 0
		for (const childRelation of parentUnit.children) {
			const childUnit = this.unitById.get(childRelation.childUnitId)
			if (!childUnit) continue
			for (let r = 0; r < childRelation.repeats; r++) {
				const slotDuration = Number(childUnit.duration)
				if (accumulatedOffset + slotDuration > offsetWithinParent) {
					return childUnit
				}
				accumulatedOffset += slotDuration
			}
		}

		// Edge case: at exact end boundary → last slot
		const lastRelation = parentUnit.children[parentUnit.children.length - 1]
		const lastUnit = this.unitById.get(lastRelation.childUnitId)
		return lastUnit ?? referenceUnit
	}

	/**
	 * Count how many target-bucket slots exist in one cycle of the given parent unit,
	 * including slots nested inside Hidden children.
	 */
	private countTargetSlotsInCycle(parentUnit: CalendarUnit, targetBucket: string): number {
		let count = 0
		for (const childRelation of parentUnit.children) {
			const childUnit = this.unitById.get(childRelation.childUnitId)
			if (!childUnit) continue
			if (childUnit.displayName.toLowerCase() === targetBucket) {
				count += childRelation.repeats
			} else if (childUnit.formatMode === 'Hidden') {
				// Recurse into hidden children to find nested target slots
				count += this.countTargetSlotsInCycle(childUnit, targetBucket) * childRelation.repeats
			}
		}
		return count
	}

	/**
	 * Count how many effective steps of the target unit fit in one cycle of the
	 * given parent unit. This mirrors the actual stepping logic:
	 * - Target-matching children: each is 1 step
	 * - Hidden children containing the target: recurse (transparent wrappers)
	 * - Non-hidden, non-matching children: each is still 1 step (step advances
	 *   through all sibling slots regardless of bucket)
	 */
	private countEffectiveStepsInCycle(parentUnit: CalendarUnit, targetBucket: string): number {
		let count = 0
		for (const childRelation of parentUnit.children) {
			const childUnit = this.unitById.get(childRelation.childUnitId)
			if (!childUnit) continue
			if (childUnit.displayName.toLowerCase() === targetBucket) {
				// Direct match: each repeat is 1 step
				count += childRelation.repeats
			} else if (childUnit.formatMode === 'Hidden') {
				// Hidden wrapper: recurse to find steps inside
				count += this.countEffectiveStepsInCycle(childUnit, targetBucket) * childRelation.repeats
			} else {
				// Non-hidden, non-matching sibling: each repeat is still 1 step
				// because the step logic advances through all slots
				count += childRelation.repeats
			}
		}
		return count
	}

	/**
	 * Determine which parent cycle a unit is currently inside at the given timestamp.
	 * A unit like "Regular year" can be a child of both "4-year-cycle" and "100-year-cycle".
	 * We walk from the root cycle down through the hierarchy to find which parent slot
	 * actually contains our unit at the current timestamp.
	 * Returns null if no parent (root unit), otherwise returns the parent unit
	 * and the absolute timestamp where the current instance of the parent cycle starts.
	 *
	 * The walk uses originTime so that raw timestamp 0 is correctly placed within
	 * the cycle hierarchy (which is anchored at absolute timestamp 0, i.e. the epoch).
	 */
	private resolveActiveParent(
		matchedUnit: CalendarUnit,
		allUnits: CalendarUnit[],
		timestamp?: number,
	): { parentUnit: CalendarUnit; parentCycleStart: number } | null {
		const ts = timestamp ?? this.timestamp

		if (matchedUnit.parents.length === 0) {
			return null
		}

		// Find the root ancestor of this unit
		const findRoot = (unit: CalendarUnit): CalendarUnit => {
			if (unit.parents.length === 0) return unit
			// Pick the parent with the largest duration to find the root
			const parentUnits = unit.parents
				.map((rel) => this.unitById.get(rel.parentUnitId))
				.filter((u): u is CalendarUnit => !!u)
			if (parentUnits.length === 0) return unit
			const largest = parentUnits.reduce((a, b) => (Number(a.duration) > Number(b.duration) ? a : b))
			return findRoot(largest)
		}

		const root = findRoot(matchedUnit)
		// The root cycle starts at ancestorCycleStart = -originTime in raw timestamp space.
		// This ensures (rawTimestamp - (-originTime)) % rootDuration = (rawTimestamp + originTime) % rootDuration,
		// correctly placing us within the absolute cycle structure.
		return this.walkDownToFindParent(root, matchedUnit, ts, allUnits, -this.originTime)
	}

	/**
	 * Walk down from `current` through the cycle hierarchy to find the immediate parent
	 * of `target` at the given timestamp. Also tracks the absolute cycle start offset.
	 */
	private walkDownToFindParent(
		current: CalendarUnit,
		target: CalendarUnit,
		timestamp: number,
		allUnits: CalendarUnit[],
		ancestorCycleStart: number,
	): { parentUnit: CalendarUnit; parentCycleStart: number } | null {
		if (current.children.length === 0) {
			return null
		}

		const duration = Number(current.duration)
		let offsetWithinCurrent = (timestamp - ancestorCycleStart) % duration
		if (offsetWithinCurrent < 0) {
			offsetWithinCurrent += duration
		}
		const currentCycleStart =
			timestamp -
			(((timestamp - ancestorCycleStart) % duration) +
				((timestamp - ancestorCycleStart) % duration < 0 ? duration : 0))

		// Walk through children slots to find which one contains this offset
		let accumulatedOffset = 0
		for (const childRelation of current.children) {
			const childUnit = this.unitById.get(childRelation.childUnitId)
			if (!childUnit) continue
			for (let r = 0; r < childRelation.repeats; r++) {
				const slotDuration = Number(childUnit.duration)
				if (accumulatedOffset + slotDuration > offsetWithinCurrent) {
					// Found the slot — is this our target?
					if (childUnit.id === target.id) {
						return { parentUnit: current, parentCycleStart: currentCycleStart }
					}
					// Not our target — recurse into this child with accumulated offset
					const childCycleStart = currentCycleStart + accumulatedOffset
					return this.walkDownToFindParent(childUnit, target, timestamp, allUnits, childCycleStart)
				}
				accumulatedOffset += slotDuration
			}
		}

		// Edge case: at exact boundary → last slot
		const lastChildRelation = current.children[current.children.length - 1]
		const lastChildUnit = this.unitById.get(lastChildRelation.childUnitId)
		if (lastChildUnit) {
			if (lastChildUnit.id === target.id) {
				return { parentUnit: current, parentCycleStart: currentCycleStart }
			}
			// Compute start of last slot
			const lastSlotStart = currentCycleStart + accumulatedOffset - Number(lastChildUnit.duration)
			return this.walkDownToFindParent(lastChildUnit, target, timestamp, allUnits, lastSlotStart)
		}

		return null
	}

	/**
	 * Resolve what child offset to preserve when moving from one unit to another.
	 * Walks the descendant hierarchy, matching by bucket (displayName).
	 * Children that exist in the old unit but not the new unit are lost.
	 */
	private resolvePreservedChildren(
		oldUnit: CalendarUnit,
		newUnit: CalendarUnit,
		parsed: ParsedTimestamp,
	): number {
		if (oldUnit.children.length === 0 || newUnit.children.length === 0) {
			return 0
		}

		// Collect current child values from the parsed timestamp
		const childValues = this.collectDescendantValues(parsed, oldUnit)

		// Rebuild offset within the new unit using bucket-matched child values
		return this.resolveChildOffset(newUnit, childValues)
	}

	/**
	 * Collect displayName → value for all descendant units of the given unit.
	 */
	private collectDescendantValues(parsed: ParsedTimestamp, unit: CalendarUnit): Map<string, number> {
		const result = new Map<string, number>()
		const visit = (u: CalendarUnit) => {
			for (const childRelation of u.children) {
				const childUnit = this.unitById.get(childRelation.childUnitId)
				if (!childUnit) continue
				const bucket = childUnit.displayName.toLowerCase()
				if (!result.has(bucket)) {
					const childEntry = [...parsed.values()].find(
						(e) => (e.unit.displayName ?? e.unit.name).toLowerCase() === bucket,
					)
					if (childEntry) {
						result.set(bucket, childEntry.value)
					}
				}
				visit(childUnit)
			}
		}
		visit(unit)
		return result
	}

	/**
	 * Given a target unit and a map of child bucket values to preserve,
	 * compute the sub-unit offset within the target unit.
	 */
	private resolveChildOffset(unit: CalendarUnit, childValues: Map<string, number>): number {
		if (unit.children.length === 0) return 0

		// Find the first child bucket that has a value to preserve
		for (const childRelation of unit.children) {
			const childUnit = this.unitById.get(childRelation.childUnitId)
			if (!childUnit) continue

			const bucket = childUnit.displayName.toLowerCase()
			const desiredValue = childValues.get(bucket)

			if (desiredValue !== undefined) {
				return this.findChildOffsetForBucketValue(unit, childUnit, desiredValue, childValues)
			}
		}

		return 0
	}

	/**
	 * Find the offset within a parent for placing a child at a given bucket index,
	 * including recursing for grandchildren.
	 */
	private findChildOffsetForBucketValue(
		parentUnit: CalendarUnit,
		targetChildUnit: CalendarUnit,
		bucketIndex: number,
		childValues: Map<string, number>,
	): number {
		const targetBucket = targetChildUnit.displayName.toLowerCase()
		let offset = 0
		let bucketCounter = 0

		for (const childRelation of parentUnit.children) {
			const childUnit = this.unitById.get(childRelation.childUnitId)
			if (!childUnit) continue

			const childBucket = childUnit.displayName.toLowerCase()
			if (childBucket === targetBucket) {
				for (let r = 0; r < childRelation.repeats; r++) {
					if (bucketCounter === bucketIndex) {
						// Found the target slot. Add grandchild offsets.
						offset += this.resolveChildOffset(childUnit, childValues)
						return offset
					}
					offset += Number(childUnit.duration)
					bucketCounter++
				}
			} else {
				offset += Number(childUnit.duration) * childRelation.repeats
			}
		}

		// bucketIndex exceeds capacity — return 0 (lose children)
		return 0
	}

	/**
	 * Return a new EsotericDate rounded down to the start of the current instance
	 * of the given unit. All sub-unit offset is stripped away.
	 */
	floor(unit: WorldCalendarUnit): EsotericDate {
		const allUnits = this.calendar.units
		const parsed = this.parse()

		// Find the target unit's entry via bucket matching (displayName)
		const targetBucket = unit.displayName.toLowerCase()
		const targetEntry = [...parsed.values()].find(
			(entry) => (entry.unit.displayName ?? entry.unit.name).toLowerCase() === targetBucket,
		)
		if (!targetEntry) {
			throw new Error('No bucket match for unit ' + unit.name)
		}

		const matchedUnit = this.unitById.get(targetEntry.unit.id)
		if (!matchedUnit) {
			throw new Error('Matched unit not found in calendar units: ' + targetEntry.unit.id)
		}

		// Find the parent of this unit.
		// Same as step(): for units with multiple parents, we walk down from the root
		// to determine which parent we're actually inside at the current timestamp.
		const parentInfo = this.resolveActiveParent(matchedUnit, allUnits)
		if (!parentInfo) {
			// Root unit — round down to the start of the current root cycle.
			// Account for originTime: the cycle aligns to absolute timestamp 0,
			// so we shift into absolute space, floor, then shift back.
			const duration = Number(matchedUnit.duration)
			const absTimestamp = this.timestamp + this.originTime
			const floored = Math.floor(absTimestamp / duration) * duration - this.originTime
			return new EsotericDate(this.calendar, floored)
		}

		const { parentUnit, parentCycleStart } = parentInfo

		// Build the slot list and find our current slot
		const slots: { unit: CalendarUnit }[] = []
		for (const childRelation of parentUnit.children) {
			const childUnit = this.unitById.get(childRelation.childUnitId)
			if (!childUnit) continue
			for (let r = 0; r < childRelation.repeats; r++) {
				slots.push({ unit: childUnit })
			}
		}

		// Find the current slot by walking the offset within the parent cycle
		const offsetWithinParent = this.timestamp - parentCycleStart
		let accumulatedOffset = 0
		let currentSlotIndex = -1
		for (let i = 0; i < slots.length; i++) {
			const slotDuration = Number(slots[i].unit.duration)
			if (accumulatedOffset + slotDuration > offsetWithinParent) {
				currentSlotIndex = i
				break
			}
			accumulatedOffset += slotDuration
		}
		if (currentSlotIndex === -1) {
			currentSlotIndex = slots.length - 1
			accumulatedOffset = Number(parentUnit.duration) - Number(slots[currentSlotIndex].unit.duration)
		}

		// The slot start offset is the accumulated offset up to the current slot
		return new EsotericDate(this.calendar, parentCycleStart + accumulatedOffset)
	}
}
