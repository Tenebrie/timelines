import { CalendarUnit } from '@api/types/calendarTypes'
import { WorldCalendar, WorldCalendarUnit } from '@api/types/worldTypes'

import { ParsedTimestamp } from './types'
import { formatTimestampUnits } from './utils/formatTimestampUnits'
import { parseTimestampMultiRoot } from './utils/parseTimestampMultiRoot'

export class EsotericDate {
	private calendar: WorldCalendar
	private timestamp: number
	private unitById: Map<string, CalendarUnit>

	constructor(calendar: WorldCalendar, timestamp: number)
	constructor(date: EsotericDate)
	constructor(calendarOrDate: WorldCalendar | EsotericDate, timestamp?: number) {
		if (calendarOrDate instanceof EsotericDate) {
			this.calendar = calendarOrDate.calendar
			this.timestamp = calendarOrDate.timestamp
			this.unitById = calendarOrDate.unitById
		} else {
			this.calendar = calendarOrDate
			this.timestamp = timestamp!
			this.unitById = new Map(calendarOrDate.units.map((u) => [u.id, u]))
		}
	}

	getTimestamp() {
		return this.timestamp
	}

	format(formatString: string) {
		const parsed = parseTimestampMultiRoot({
			allUnits: this.calendar.units,
			timestamp: this.timestamp,
		})
		return formatTimestampUnits(this.calendar.units, parsed, formatString)
	}

	getBucketId(unit: CalendarUnit) {
		const parsed = parseTimestampMultiRoot({
			allUnits: this.calendar.units,
			timestamp: this.timestamp + this.originTime,
		})
		return parsed
			.values()
			.find((entry) => entry.unit.displayName?.toLowerCase() === unit.displayName.toLowerCase())?.unit.id
	}

	get(unit: WorldCalendarUnit) {
		const parsed = parseTimestampMultiRoot({
			allUnits: this.calendar.units,
			timestamp: this.timestamp + this.originTime,
		})
		const bucketId = parsed
			.values()
			.find((entry) => entry.unit.displayName?.toLowerCase() === unit.displayName.toLowerCase())?.unit.id
		if (!bucketId) {
			throw new Error('No bucketId match for unit ' + unit.name)
		}
		return parsed.get(bucketId)
	}

	getDuration(unit: CalendarUnit) {
		const parsed = parseTimestampMultiRoot({
			allUnits: this.calendar.units,
			timestamp: this.timestamp + this.originTime,
		})
		return parsed.get(unit.id)?.unit.duration ?? 0
	}

	private get originTime(): number {
		return this.calendar.originTime
	}

	step(unit: WorldCalendarUnit, amount: number = 1): EsotericDate {
		if (amount === 0) {
			return new EsotericDate(this.calendar, this.timestamp)
		}

		const allUnits = this.calendar.units
		const parsed = parseTimestampMultiRoot({ allUnits, timestamp: this.timestamp + this.originTime })

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
		// A unit can have multiple parents (e.g. Regular year is child of both 4-year-cycle and 100-year-cycle).
		// We must determine which parent we're actually inside at the current timestamp by checking
		// the actual hierarchy from root down.
		const parentInfo = this.resolveActiveParent(matchedUnit, allUnits)
		if (!parentInfo) {
			// Root unit — no parent cycle to walk. Just add amount * duration.
			return new EsotericDate(this.calendar, this.timestamp + amount * Number(matchedUnit.duration))
		}

		const { parentUnit, parentCycleStart } = parentInfo

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

		// Step forward (or backward) by amount slots
		const newSlotIndex = currentSlotIndex + amount
		const totalSlots = slots.length

		// Check if any sibling slot is a Hidden unit that contains the target unit.
		// If so, we can't use flat slot arithmetic because hidden siblings contain multiple
		// instances of the target unit. Instead, use boundary-crossing recursion.
		const hasHiddenSiblings = slots.some(
			(s) =>
				s.unit.formatMode === 'Hidden' &&
				s.unit.children.some((ch) => {
					const childUnit = this.unitById.get(ch.childUnitId)
					return childUnit && childUnit.displayName.toLowerCase() === targetBucket
				}),
		)

		// Check if the step would land on a Hidden sibling or cross the parent boundary.
		// In either case, we can't use flat slot arithmetic — we must use boundary-crossing
		// recursion to correctly resolve into/through hidden units.
		const wouldLandOnHiddenSibling =
			hasHiddenSiblings &&
			newSlotIndex >= 0 &&
			newSlotIndex < totalSlots &&
			slots[newSlotIndex].unit.formatMode === 'Hidden'

		if (hasHiddenSiblings && (newSlotIndex < 0 || newSlotIndex >= totalSlots || wouldLandOnHiddenSibling)) {
			// The step would cross into or past a hidden sibling, or land directly on one.
			// Use boundary-crossing recursion: step to the edge of the current slot,
			// then recurse from the boundary position.
			if (amount > 0) {
				// Forward: step to end of current slot, then recurse with remaining
				const currentSlotDuration = Number(slots[currentSlotIndex].unit.duration)
				const currentSlotStart = parentCycleStart + accumulatedOffset
				const nextSlotStart = currentSlotStart + currentSlotDuration
				const slotsConsumed = 1 // We consume the rest of the current slot (1 step)
				const remaining = amount - slotsConsumed
				if (remaining === 0) {
					const childOffset2 = this.resolvePreservedChildren(matchedUnit, matchedUnit, parsed)
					return new EsotericDate(this.calendar, nextSlotStart + childOffset2)
				}
				const dateAtBoundary = new EsotericDate(this.calendar, nextSlotStart)
				const result = dateAtBoundary.step(unit, remaining)
				return new EsotericDate(this.calendar, result.timestamp)
			} else {
				// Backward: step to start of current slot, then recurse with remaining
				const currentSlotStart = parentCycleStart + accumulatedOffset
				const prevEnd = currentSlotStart - 1
				const slotsConsumed = 1 // We consume the current slot (1 step back to its start)
				const remaining = amount + slotsConsumed // amount is negative, so this reduces magnitude
				if (remaining === 0) {
					// Land on the last instance of the target unit before our current slot
					const dateAtBoundary = new EsotericDate(this.calendar, prevEnd)
					const floored = dateAtBoundary.floor(unit)
					const childOffset2 = this.resolvePreservedChildren(matchedUnit, matchedUnit, parsed)
					return new EsotericDate(this.calendar, floored.timestamp + childOffset2)
				}
				// Floor to the last target unit slot before our current slot, then recurse
				const dateAtBoundary = new EsotericDate(this.calendar, prevEnd)
				const floored = dateAtBoundary.floor(unit)
				const result = floored.step(unit, remaining)
				return new EsotericDate(this.calendar, result.timestamp)
			}
		}

		// Calculate overflow into parent and wrapped position within the cycle
		const parentOverflow = Math.floor(newSlotIndex / totalSlots)
		let wrappedSlotIndex = newSlotIndex % totalSlots
		if (wrappedSlotIndex < 0) {
			wrappedSlotIndex += totalSlots
		}

		const newSlot = slots[wrappedSlotIndex]

		// Compute offset from parent cycle start to the start of the new slot
		let newSlotStartOffset = 0
		for (let i = 0; i < wrappedSlotIndex; i++) {
			newSlotStartOffset += Number(slots[i].unit.duration)
		}

		// Preserve child values: clamp remainder to the new slot's duration,
		// and resolve which children survive via bucket matching
		const childOffset = this.resolvePreservedChildren(matchedUnit, newSlot.unit, parsed)

		// Build the new timestamp: parent cycle start + new slot offset + preserved children
		let newTimestamp = parentCycleStart + newSlotStartOffset + childOffset

		// Handle parent overflow by recursing
		if (parentOverflow !== 0) {
			if (parentUnit.formatMode === 'Hidden') {
				// Hidden parent overflow: the child stepped past the hidden parent boundary.
				// Instead of wrapping within the hidden parent and shifting it, step to the
				// boundary of the hidden parent and recursively step with remaining amount.
				// This correctly handles cases where the next position after the hidden parent
				// is a different unit type (e.g. trailing Regular years after 4-year-cycles).
				if (parentOverflow > 0) {
					// Forward: step to the first slot of the next position after this hidden parent
					const parentDuration = Number(parentUnit.duration)
					const nextParentStart = parentCycleStart + parentDuration
					const dateAtBoundary = new EsotericDate(this.calendar, nextParentStart)
					// We consumed (totalSlots - currentSlotIndex) slots to reach the boundary,
					// leaving (amount - (totalSlots - currentSlotIndex)) remaining
					const slotsToEnd = totalSlots - currentSlotIndex
					const remaining = amount - slotsToEnd
					if (remaining === 0) {
						// Exactly at the boundary — preserve children
						newTimestamp = nextParentStart + childOffset
					} else {
						const result = dateAtBoundary.step(unit, remaining)
						newTimestamp = result.timestamp
					}
				} else {
					// Backward: step to the last slot of the position before this hidden parent
					const prevParentEnd = parentCycleStart - 1
					const dateAtBoundary = new EsotericDate(this.calendar, prevParentEnd)
					// We consumed (currentSlotIndex + 1) slots to reach the start boundary,
					// so remaining = amount + currentSlotIndex + 1 (amount is negative)
					const slotsToStart = currentSlotIndex + 1
					const remaining = amount + slotsToStart
					if (remaining === 0) {
						// We want to land on the last slot of the previous position
						const flooredBoundary = dateAtBoundary.floor(unit)
						newTimestamp = flooredBoundary.timestamp + childOffset
					} else {
						// Floor to the last year-slot of the previous position, then step remaining
						const flooredBoundary = dateAtBoundary.floor(unit)
						const result = flooredBoundary.step(unit, remaining)
						newTimestamp = result.timestamp
					}
				}
			} else {
				// Visible parent overflow: the child stepped past its visible parent boundary.
				// We use boundary-crossing recursion (same as hidden parents) to avoid the
				// problem where wrapping the child index within the current parent and then
				// stepping the parent separately loses the child position when the destination
				// parent has a different number of children (e.g. 13-month leap year → 12-month
				// regular year would lose month 12).
				if (parentOverflow > 0) {
					// Forward: step to the first slot of the next parent instance
					const parentDuration = Number(parentUnit.duration)
					const nextParentStart = parentCycleStart + parentDuration
					const slotsToEnd = totalSlots - currentSlotIndex
					const remaining = amount - slotsToEnd
					if (remaining === 0) {
						// Land on the first slot of the next parent, preserving children
						const dateAtBoundary = new EsotericDate(this.calendar, nextParentStart)
						const flooredBoundary = dateAtBoundary.floor(unit)
						newTimestamp = flooredBoundary.timestamp + childOffset
					} else {
						const dateAtBoundary = new EsotericDate(this.calendar, nextParentStart)
						const result = dateAtBoundary.step(unit, remaining)
						newTimestamp = result.timestamp
					}
				} else {
					// Backward: step to the last slot of the previous parent instance
					const prevParentEnd = parentCycleStart - 1
					const slotsToStart = currentSlotIndex + 1
					const remaining = amount + slotsToStart
					if (remaining === 0) {
						// Land on the last slot of the previous parent, preserving children
						const dateAtBoundary = new EsotericDate(this.calendar, prevParentEnd)
						const flooredBoundary = dateAtBoundary.floor(unit)
						newTimestamp = flooredBoundary.timestamp + childOffset
					} else {
						const dateAtBoundary = new EsotericDate(this.calendar, prevParentEnd)
						const flooredBoundary = dateAtBoundary.floor(unit)
						const result = flooredBoundary.step(unit, remaining)
						newTimestamp = result.timestamp
					}
				}
			}
		}

		return new EsotericDate(this.calendar, newTimestamp)
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
		const parsed = parseTimestampMultiRoot({ allUnits, timestamp: this.timestamp + this.originTime })

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
