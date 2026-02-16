import { CalendarUnit } from '@api/types/calendarTypes'
import { WorldCalendar, WorldCalendarUnit } from '@api/types/worldTypes'

import { ParsedTimestamp } from './types'
import { formatTimestampUnits } from './utils/formatTimestampUnits'
import { parseTimestampMultiRoot } from './utils/parseTimestampMultiRoot'

export class EsotericDate {
	private calendar: WorldCalendar
	private timestamp: number

	constructor(calendar: WorldCalendar, timestamp: number)
	constructor(date: EsotericDate)
	constructor(calendarOrDate: WorldCalendar | EsotericDate, timestamp?: number) {
		if (calendarOrDate instanceof EsotericDate) {
			this.calendar = calendarOrDate.calendar
			this.timestamp = calendarOrDate.timestamp
		} else {
			this.calendar = calendarOrDate
			this.timestamp = timestamp!
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
		const bucketId = this.getBucketId(unit)
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

		const matchedUnit = allUnits.find((u) => u.id === targetEntry.unit.id)
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
			const childUnit = allUnits.find((u) => u.id === childRelation.childUnitId)
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
		const childOffset = this.resolvePreservedChildren(matchedUnit, newSlot.unit, parsed, allUnits)

		// Build the new timestamp: parent cycle start + new slot offset + preserved children
		let newTimestamp = parentCycleStart + newSlotStartOffset + childOffset

		// Handle parent overflow by recursing
		if (parentOverflow !== 0) {
			if (parentUnit.formatMode === 'Hidden') {
				// Hidden parent — step through the hidden cycle hierarchy
				newTimestamp = this.stepHiddenParent(newTimestamp, parentUnit, parentOverflow, allUnits)
			} else {
				// Visible parent — recurse to handle its own cycle structure
				const dateAtNewPos = new EsotericDate(this.calendar, newTimestamp)
				const adjusted = dateAtNewPos.step(parentUnit, parentOverflow)
				newTimestamp = adjusted.timestamp
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
				.map((rel) => allUnits.find((u) => u.id === rel.parentUnitId))
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
			const childUnit = allUnits.find((u) => u.id === childRelation.childUnitId)
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
		const lastChildUnit = allUnits.find((u) => u.id === lastChildRelation.childUnitId)
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
	 * Step a hidden parent unit by `amount` within its own parent cycle.
	 * Hidden parents aren't in the parsed map, so we can't use `step` on them directly.
	 * We use the walk-down approach to find the correct grandparent and cycle start,
	 * then step through the grandparent's slot list.
	 */
	private stepHiddenParent(
		timestamp: number,
		hiddenUnit: CalendarUnit,
		amount: number,
		allUnits: CalendarUnit[],
	): number {
		// Use resolveActiveParent to find which grandparent we're in and where it starts
		const parentInfo = this.resolveActiveParent(hiddenUnit, allUnits, timestamp)
		if (!parentInfo) {
			// Hidden unit is root — just add amount * duration
			return timestamp + amount * Number(hiddenUnit.duration)
		}

		const { parentUnit: grandparentUnit, parentCycleStart: grandparentCycleStart } = parentInfo

		// Build the grandparent's slot list
		type Slot = { unit: CalendarUnit; slotIndexInBucket: number }
		const slots: Slot[] = []
		const bucketCounters = new Map<string, number>()
		for (const childRelation of grandparentUnit.children) {
			const childUnit = allUnits.find((u) => u.id === childRelation.childUnitId)
			if (!childUnit) continue
			const bucket = childUnit.displayName.toLowerCase()
			for (let r = 0; r < childRelation.repeats; r++) {
				const idx = bucketCounters.get(bucket) ?? 0
				slots.push({ unit: childUnit, slotIndexInBucket: idx })
				bucketCounters.set(bucket, idx + 1)
			}
		}

		if (slots.length === 0) {
			return timestamp + amount * Number(hiddenUnit.duration)
		}

		// Find the current slot using the offset within the grandparent
		const offsetWithinGrandparent = timestamp - grandparentCycleStart

		let accumulatedOffset = 0
		let currentSlotIndex = -1
		for (let i = 0; i < slots.length; i++) {
			const slotDuration = Number(slots[i].unit.duration)
			if (accumulatedOffset + slotDuration > offsetWithinGrandparent) {
				currentSlotIndex = i
				break
			}
			accumulatedOffset += slotDuration
		}
		if (currentSlotIndex === -1) {
			currentSlotIndex = slots.length - 1
		}

		// Step by amount
		const newSlotIndex = currentSlotIndex + amount
		const totalSlots = slots.length

		const grandparentOverflow = Math.floor(newSlotIndex / totalSlots)
		let wrappedSlotIndex = newSlotIndex % totalSlots
		if (wrappedSlotIndex < 0) {
			wrappedSlotIndex += totalSlots
		}

		// Compute offset from grandparent cycle start to the new slot
		let newSlotStartOffset = 0
		for (let i = 0; i < wrappedSlotIndex; i++) {
			newSlotStartOffset += Number(slots[i].unit.duration)
		}

		// Preserve the offset within the hidden unit (sub-slot position)
		const offsetWithinCurrentSlot = offsetWithinGrandparent - accumulatedOffset
		let newTimestamp = grandparentCycleStart + newSlotStartOffset + offsetWithinCurrentSlot

		// Handle grandparent overflow recursively
		if (grandparentOverflow !== 0) {
			if (grandparentUnit.formatMode === 'Hidden') {
				newTimestamp = this.stepHiddenParent(newTimestamp, grandparentUnit, grandparentOverflow, allUnits)
			} else {
				const dateAtNewPos = new EsotericDate(this.calendar, newTimestamp)
				const adjusted = dateAtNewPos.step(grandparentUnit, grandparentOverflow)
				newTimestamp = adjusted.timestamp
			}
		}

		return newTimestamp
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
		allUnits: CalendarUnit[],
	): number {
		if (oldUnit.children.length === 0 || newUnit.children.length === 0) {
			return 0
		}

		// Collect current child values from the parsed timestamp
		const childValues = this.collectDescendantValues(parsed, oldUnit, allUnits)

		// Rebuild offset within the new unit using bucket-matched child values
		return this.resolveChildOffset(newUnit, childValues, allUnits)
	}

	/**
	 * Collect displayName → value for all descendant units of the given unit.
	 */
	private collectDescendantValues(
		parsed: ParsedTimestamp,
		unit: CalendarUnit,
		allUnits: CalendarUnit[],
	): Map<string, number> {
		const result = new Map<string, number>()
		const visit = (u: CalendarUnit) => {
			for (const childRelation of u.children) {
				const childUnit = allUnits.find((cu) => cu.id === childRelation.childUnitId)
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
	private resolveChildOffset(
		unit: CalendarUnit,
		childValues: Map<string, number>,
		allUnits: CalendarUnit[],
	): number {
		if (unit.children.length === 0) return 0

		// Find the first child bucket that has a value to preserve
		for (const childRelation of unit.children) {
			const childUnit = allUnits.find((u) => u.id === childRelation.childUnitId)
			if (!childUnit) continue

			const bucket = childUnit.displayName.toLowerCase()
			const desiredValue = childValues.get(bucket)

			if (desiredValue !== undefined) {
				return this.findChildOffsetForBucketValue(unit, childUnit, desiredValue, childValues, allUnits)
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
		allUnits: CalendarUnit[],
	): number {
		const targetBucket = targetChildUnit.displayName.toLowerCase()
		let offset = 0
		let bucketCounter = 0

		for (const childRelation of parentUnit.children) {
			const childUnit = allUnits.find((u) => u.id === childRelation.childUnitId)
			if (!childUnit) continue

			const childBucket = childUnit.displayName.toLowerCase()
			if (childBucket === targetBucket) {
				for (let r = 0; r < childRelation.repeats; r++) {
					if (bucketCounter === bucketIndex) {
						// Found the target slot. Add grandchild offsets.
						offset += this.resolveChildOffset(childUnit, childValues, allUnits)
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

		const matchedUnit = allUnits.find((u) => u.id === targetEntry.unit.id)
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
			const childUnit = allUnits.find((u) => u.id === childRelation.childUnitId)
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
