import { CalendarUnit } from '@api/types/calendarTypes'
import { WorldCalendar, WorldCalendarUnit } from '@api/types/worldTypes'

import { ParsedTimestamp } from './types'
import { formatTimestampUnits } from './utils/formatTimestampUnits'
import { parseTimestampMultiRoot } from './utils/parseTimestampMultiRoot'

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface ParentInfo {
	parentUnit: CalendarUnit
	/** Raw timestamp where the current instance of parentUnit starts */
	parentCycleStart: number
}

interface Slot {
	unit: CalendarUnit
	/** Offset from parentCycleStart (not absolute) */
	startOffset: number
}

// ---------------------------------------------------------------------------
// Module-level calendar cache
//
// Keyed by `${calendar.id}:${calendar.updatedAt}` so it auto-invalidates
// when the calendar is saved. Stores derived structures that are pure
// functions of the calendar definition and never depend on timestamps.
// ---------------------------------------------------------------------------

interface CalendarCache {
	/** Pre-built slot arrays for each parent unit, keyed by unit ID */
	slotsByUnitId: Map<string, Slot[]>
	/** countTargetSlotsInCycle results, keyed by `${unitId}:${targetBucket}` */
	targetSlotCounts: Map<string, number>
	/** Root ancestor for each unit, keyed by unit ID */
	rootByUnitId: Map<string, CalendarUnit>
	/** unitById map (avoids re-building per EsotericDate instance) */
	unitById: Map<string, CalendarUnit>
}

const calendarCacheMap = new Map<string, CalendarCache>()

function getCalendarCache(calendar: WorldCalendar): CalendarCache {
	const key = `${calendar.id}:${calendar.updatedAt}`
	const existing = calendarCacheMap.get(key)
	if (existing) return existing

	// Evict stale entries for the same calendar id (different updatedAt)
	for (const k of calendarCacheMap.keys()) {
		if (k.startsWith(`${calendar.id}:`)) {
			calendarCacheMap.delete(k)
		}
	}

	const unitById = new Map(calendar.units.map((u) => [u.id, u]))

	// Pre-build slot arrays for every unit that has children
	const slotsByUnitId = new Map<string, Slot[]>()
	for (const unit of calendar.units) {
		if (unit.children.length === 0) continue
		const slots: Slot[] = []
		let offset = 0
		for (const rel of unit.children) {
			const childUnit = unitById.get(rel.childUnitId)
			if (!childUnit) continue
			for (let r = 0; r < rel.repeats; r++) {
				slots.push({ unit: childUnit, startOffset: offset })
				offset += Number(childUnit.duration)
			}
		}
		slotsByUnitId.set(unit.id, slots)
	}

	// Pre-compute root ancestors
	const rootByUnitId = new Map<string, CalendarUnit>()
	const findRootUncached = (unit: CalendarUnit): CalendarUnit => {
		if (unit.parents.length === 0) return unit
		const parents = unit.parents
			.map((rel) => unitById.get(rel.parentUnitId))
			.filter((u): u is CalendarUnit => !!u)
		if (parents.length === 0) return unit
		return findRootUncached(parents.reduce((a, b) => (Number(a.duration) > Number(b.duration) ? a : b)))
	}
	for (const unit of calendar.units) {
		rootByUnitId.set(unit.id, findRootUncached(unit))
	}

	const cache: CalendarCache = {
		slotsByUnitId,
		targetSlotCounts: new Map(),
		rootByUnitId,
		unitById,
	}
	calendarCacheMap.set(key, cache)
	return cache
}

// ---------------------------------------------------------------------------
// EsotericDate
// ---------------------------------------------------------------------------

export class EsotericDate {
	private calendar: WorldCalendar
	private timestamp: number
	/** Shared with all EsotericDates on the same calendar version — never mutated */
	readonly _cache: CalendarCache
	private _parsedCache: ParsedTimestamp | null = null

	constructor(calendar: WorldCalendar, timestamp: number)
	constructor(date: EsotericDate)
	constructor(calendarOrDate: WorldCalendar | EsotericDate, timestamp?: number) {
		if (calendarOrDate instanceof EsotericDate) {
			this.calendar = calendarOrDate.calendar
			this.timestamp = calendarOrDate.timestamp
			this._cache = calendarOrDate._cache
			this._parsedCache = calendarOrDate._parsedCache
		} else {
			this.calendar = calendarOrDate
			this.timestamp = timestamp!
			this._cache = getCalendarCache(calendarOrDate)
		}
	}

	// -------------------------------------------------------------------------
	// Public API
	// -------------------------------------------------------------------------

	getTimestamp(): number {
		return this.timestamp
	}

	format(formatString: string): string {
		return formatTimestampUnits(this.calendar.units, this.parse(), formatString)
	}

	getBucketId(unit: CalendarUnit): string | undefined {
		return [...this.parse().values()].find((e) => this.sameBucket(e.unit, unit))?.unit.id
	}

	get(unit: WorldCalendarUnit) {
		const parsed = this.parse()
		const entry = [...parsed.values()].find((e) => this.sameBucket(e.unit, unit))
		if (!entry) throw new Error('No bucket match for unit ' + unit.name)
		return parsed.get(entry.unit.id)
	}

	getDuration(unit: CalendarUnit): number {
		return Number(this.parse().get(unit.id)?.unit.duration) ?? 0
	}

	/**
	 * Step by `amount` instances of the given calendar unit type.
	 * Sub-unit offsets (e.g. hour within a day) are preserved at the destination.
	 */
	step(unit: WorldCalendarUnit, amount: number = 1): EsotericDate {
		if (amount === 0) {
			return new EsotericDate(this.calendar, this.timestamp)
		}

		// Parse once and thread through all internal calls
		const parsed = this.parse()
		const matchedUnit = this.resolveMatchedUnit(unit, parsed)

		const floored = this.floorInternal(matchedUnit)
		const stepped = floored.stepFloored(unit, matchedUnit, amount)
		const destUnit = stepped.resolveActualUnit(matchedUnit)
		const childValues = this.collectDescendantValues(parsed, matchedUnit)
		const childOffset = this.resolveChildOffset(destUnit, childValues)

		return new EsotericDate(this.calendar, stepped.timestamp + childOffset)
	}

	/**
	 * Return a new EsotericDate rounded down to the start of the current
	 * instance of the given unit.
	 */
	floor(unit: WorldCalendarUnit): EsotericDate {
		const parsed = this.parse()
		const matchedUnit = this.resolveMatchedUnit(unit, parsed)
		return this.floorInternal(matchedUnit)
	}

	/**
	 * Return a new EsotericDate rounded to the nearest instance of the
	 * given unit (rounds to the closer of floor and ceil).
	 */
	round(unit: WorldCalendarUnit): EsotericDate {
		const parsed = this.parse()
		const matchedUnit = this.resolveMatchedUnit(unit, parsed)
		const floored = this.floorInternal(matchedUnit)
		const ceiled = floored.stepFloored(unit, matchedUnit, 1)
		const distToFloor = this.timestamp - floored.timestamp
		const distToCeil = ceiled.timestamp - this.timestamp
		return distToCeil < distToFloor ? ceiled : floored
	}

	// -------------------------------------------------------------------------
	// Internal floor (accepts pre-resolved unit, avoids re-parsing)
	// -------------------------------------------------------------------------

	private floorInternal(matchedUnit: CalendarUnit): EsotericDate {
		const parentInfo = this.resolveActiveParent(matchedUnit)
		if (!parentInfo) {
			const duration = Number(matchedUnit.duration)
			const absTs = this.timestamp + this.originTime
			const floored = Math.floor(absTs / duration) * duration - this.originTime
			return new EsotericDate(this.calendar, floored)
		}

		const { parentUnit, parentCycleStart } = parentInfo
		const slots = this.getSlots(parentUnit)
		const slot = this.findSlot(slots, parentCycleStart, this.timestamp)
		return new EsotericDate(this.calendar, parentCycleStart + slot.startOffset)
	}

	// -------------------------------------------------------------------------
	// Core stepping engine
	// -------------------------------------------------------------------------

	/**
	 * Step assuming `this` is already floored to the target unit.
	 * Accepts pre-resolved matchedUnit and parsed to avoid redundant work.
	 */
	private stepFloored(unit: WorldCalendarUnit, matchedUnit: CalendarUnit, amount: number): EsotericDate {
		if (amount === 0) {
			return new EsotericDate(this.calendar, this.timestamp)
		}

		// Root unit: no parent, just multiply duration
		const parentInfo = this.resolveActiveParent(matchedUnit)
		if (!parentInfo) {
			return new EsotericDate(this.calendar, this.timestamp + amount * Number(matchedUnit.duration))
		}

		const { parentUnit, parentCycleStart } = parentInfo
		const targetBucket = this.bucketOf(unit)

		// Bulk-skip whole root cycles when safe
		const root = this._cache.rootByUnitId.get(matchedUnit.id) ?? matchedUnit
		const isRootImmediateParent = matchedUnit.parents.some((rel) => rel.parentUnitId === root.id)
		if (root.id !== matchedUnit.id && !isRootImmediateParent) {
			const rootTargetSlots = this.countTargetSlotsInCycle(root, targetBucket)
			if (rootTargetSlots > 0) {
				const fullCycles = Math.trunc(amount / rootTargetSlots)
				if (fullCycles !== 0) {
					const remainder = amount - fullCycles * rootTargetSlots
					const jumped = new EsotericDate(this.calendar, this.timestamp + fullCycles * Number(root.duration))
					if (remainder === 0) return jumped
					const jumpedMatchedUnit = jumped.resolveMatchedUnit(unit, jumped.parse())
					return jumped.stepFloored(unit, jumpedMatchedUnit, remainder)
				}
			}
		}

		const slots = this.getSlots(parentUnit)
		const currentSlot = this.findSlot(slots, parentCycleStart, this.timestamp)
		const currentIndex = slots.indexOf(currentSlot)

		return this.walkSlots(unit, amount, slots, currentIndex, parentUnit, parentCycleStart)
	}

	/**
	 * Walk through the slot list, consuming steps toward `amount`.
	 */
	private walkSlots(
		unit: WorldCalendarUnit,
		amount: number,
		slots: Slot[],
		currentIndex: number,
		parentUnit: CalendarUnit,
		parentCycleStart: number,
	): EsotericDate {
		const targetBucket = this.bucketOf(unit)
		const direction = amount > 0 ? 1 : -1
		let remaining = amount
		let slotIndex = currentIndex

		while (remaining !== 0) {
			const nextIndex = slotIndex + direction

			// ---- Overflow: past the parent cycle boundary ----
			if (nextIndex < 0 || nextIndex >= slots.length) {
				const parentDuration = Number(parentUnit.duration)
				const adjacentTs = direction > 0 ? parentCycleStart + parentDuration : parentCycleStart - 1

				const adjacent = new EsotericDate(this.calendar, adjacentTs)
				const adjacentParsed = adjacent.parse()
				const adjacentMatchedUnit = adjacent.resolveMatchedUnit(unit, adjacentParsed)
				const floored = adjacent.floorInternal(adjacentMatchedUnit)

				if (remaining === direction) return floored
				return floored.stepFloored(unit, adjacentMatchedUnit, remaining - direction)
			}

			slotIndex = nextIndex
			const slot = slots[slotIndex]

			// ---- Hidden unit: recurse inside it transparently ----
			if (slot.unit.formatMode === 'Hidden') {
				const innerCount = this.countTargetSlotsInCycle(slot.unit, targetBucket)
				if (innerCount === 0) continue

				if (Math.abs(remaining) <= innerCount) {
					const hiddenAbsStart = parentCycleStart + slot.startOffset
					const enterTs = direction > 0 ? hiddenAbsStart : hiddenAbsStart + Number(slot.unit.duration) - 1
					const entered = new EsotericDate(this.calendar, enterTs)
					const enteredMatchedUnit = entered.resolveMatchedUnit(unit, entered.parse())
					const enteredFloored = entered.floorInternal(enteredMatchedUnit)
					return enteredFloored.stepFloored(unit, enteredMatchedUnit, remaining - direction)
				}

				remaining -= direction * innerCount
				continue
			}

			// ---- Normal slot ----
			if (this.bucketOf(slot.unit) === targetBucket) {
				remaining -= direction
				if (remaining === 0) {
					return new EsotericDate(this.calendar, parentCycleStart + slot.startOffset)
				}
			}
		}

		throw new Error('walkSlots: exhausted without reaching target')
	}

	// -------------------------------------------------------------------------
	// Parent resolution
	// -------------------------------------------------------------------------

	private resolveActiveParent(matchedUnit: CalendarUnit): ParentInfo | null {
		if (matchedUnit.parents.length === 0) return null

		const root = this._cache.rootByUnitId.get(matchedUnit.id) ?? matchedUnit
		const rootDuration = Number(root.duration)
		const absTs = this.timestamp + this.originTime
		const rootOffset = ((absTs % rootDuration) + rootDuration) % rootDuration
		const rootCycleStart = this.timestamp - rootOffset

		return this.walkDownToParent(root, matchedUnit, this.timestamp, rootCycleStart)
	}

	private walkDownToParent(
		current: CalendarUnit,
		target: CalendarUnit,
		timestamp: number,
		currentCycleStart: number,
	): ParentInfo | null {
		if (current.children.length === 0) return null

		const slots = this.getSlots(current)
		const slot = this.findSlot(slots, currentCycleStart, timestamp)
		const childStart = currentCycleStart + slot.startOffset

		if (slot.unit.id === target.id) {
			return { parentUnit: current, parentCycleStart: currentCycleStart }
		}

		return this.walkDownToParent(slot.unit, target, timestamp, childStart)
	}

	// -------------------------------------------------------------------------
	// Slot access (cached)
	// -------------------------------------------------------------------------

	/** Returns the pre-built slot array for a parent unit (never allocates). */
	private getSlots(parentUnit: CalendarUnit): Slot[] {
		return this._cache.slotsByUnitId.get(parentUnit.id) ?? []
	}

	private findSlot(slots: Slot[], parentCycleStart: number, timestamp: number): Slot {
		if (slots.length === 0) throw new Error('findSlot: empty slot list')

		const offsetWithinParent = timestamp - parentCycleStart

		for (const slot of slots) {
			if (offsetWithinParent < slot.startOffset + Number(slot.unit.duration)) {
				return slot
			}
		}
		return slots[slots.length - 1]
	}

	// -------------------------------------------------------------------------
	// Unit resolution helpers
	// -------------------------------------------------------------------------

	private resolveActualUnit(referenceUnit: CalendarUnit): CalendarUnit {
		if (referenceUnit.parents.length === 0) return referenceUnit

		const targetBucket = this.bucketOf(referenceUnit)
		const parsed = this.parse()

		const entry = [...parsed.values()].find((e) => this.bucketOf(e.unit) === targetBucket)
		if (entry) {
			const matched = this._cache.unitById.get(entry.unit.id)
			if (matched) return matched
		}

		const root = this._cache.rootByUnitId.get(referenceUnit.id) ?? referenceUnit
		const rootDuration = Number(root.duration)
		const absTs = this.timestamp + this.originTime
		const rootOffset = ((absTs % rootDuration) + rootDuration) % rootDuration
		const rootCycleStart = this.timestamp - rootOffset

		const found = this.findBucketSlotFromRoot(root, targetBucket, this.timestamp, rootCycleStart)
		return found ?? referenceUnit
	}

	private findBucketSlotFromRoot(
		current: CalendarUnit,
		targetBucket: string,
		timestamp: number,
		currentCycleStart: number,
	): CalendarUnit | null {
		if (this.bucketOf(current) === targetBucket) return current
		if (current.children.length === 0) return null

		const slots = this.getSlots(current)
		const slot = this.findSlot(slots, currentCycleStart, timestamp)
		const childStart = currentCycleStart + slot.startOffset

		if (this.bucketOf(slot.unit) === targetBucket) return slot.unit

		return this.findBucketSlotFromRoot(slot.unit, targetBucket, timestamp, childStart)
	}

	private resolveMatchedUnit(unit: WorldCalendarUnit, parsed: ParsedTimestamp): CalendarUnit {
		const entry = [...parsed.values()].find((e) => this.sameBucket(e.unit, unit))
		if (entry) {
			const matched = this._cache.unitById.get(entry.unit.id)
			if (matched) return matched
		}

		const fallback = [...this._cache.unitById.values()].find((u) => this.sameBucket(u, unit))
		if (fallback) return fallback

		throw new Error('No bucket match for unit ' + unit.name)
	}

	// -------------------------------------------------------------------------
	// Counting helpers (cached)
	// -------------------------------------------------------------------------

	private countTargetSlotsInCycle(parentUnit: CalendarUnit, targetBucket: string): number {
		const cacheKey = `${parentUnit.id}:${targetBucket}`
		const cached = this._cache.targetSlotCounts.get(cacheKey)
		if (cached !== undefined) return cached

		let count = 0
		for (const rel of parentUnit.children) {
			const childUnit = this._cache.unitById.get(rel.childUnitId)
			if (!childUnit) continue
			if (this.bucketOf(childUnit) === targetBucket) {
				count += rel.repeats
			} else if (childUnit.formatMode === 'Hidden') {
				count += this.countTargetSlotsInCycle(childUnit, targetBucket) * rel.repeats
			}
		}

		this._cache.targetSlotCounts.set(cacheKey, count)
		return count
	}

	// -------------------------------------------------------------------------
	// Child value preservation
	// -------------------------------------------------------------------------

	private collectDescendantValues(parsed: ParsedTimestamp, unit: CalendarUnit): Map<string, number> {
		const result = new Map<string, number>()
		const visit = (u: CalendarUnit) => {
			for (const rel of u.children) {
				const childUnit = this._cache.unitById.get(rel.childUnitId)
				if (!childUnit) continue
				const bucket = this.bucketOf(childUnit)
				if (!result.has(bucket)) {
					const entry = [...parsed.values()].find((e) => this.bucketOf(e.unit) === bucket)
					if (entry) result.set(bucket, entry.value)
				}
				visit(childUnit)
			}
		}
		visit(unit)
		return result
	}

	private resolveChildOffset(unit: CalendarUnit, childValues: Map<string, number>): number {
		if (unit.children.length === 0) return 0
		for (const rel of unit.children) {
			const childUnit = this._cache.unitById.get(rel.childUnitId)
			if (!childUnit) continue
			const desired = childValues.get(this.bucketOf(childUnit))
			if (desired !== undefined) {
				return this.findChildOffsetForBucketValue(unit, childUnit, desired, childValues)
			}
		}
		return 0
	}

	private findChildOffsetForBucketValue(
		parentUnit: CalendarUnit,
		targetChildUnit: CalendarUnit,
		bucketIndex: number,
		childValues: Map<string, number>,
	): number {
		const targetBucket = this.bucketOf(targetChildUnit)
		let offset = 0
		let bucketCounter = 0
		let lastMatchOffset = -1
		let lastMatchUnit: CalendarUnit | null = null

		for (const rel of parentUnit.children) {
			const childUnit = this._cache.unitById.get(rel.childUnitId)
			if (!childUnit) continue

			if (this.bucketOf(childUnit) === targetBucket) {
				for (let r = 0; r < rel.repeats; r++) {
					if (bucketCounter === bucketIndex) {
						return offset + this.resolveChildOffset(childUnit, childValues)
					}
					lastMatchOffset = offset
					lastMatchUnit = childUnit
					offset += Number(childUnit.duration)
					bucketCounter++
				}
			} else {
				offset += Number(childUnit.duration) * rel.repeats
			}
		}

		if (lastMatchUnit !== null && lastMatchOffset >= 0) {
			return lastMatchOffset + this.resolveChildOffset(lastMatchUnit, childValues)
		}
		return 0
	}

	// -------------------------------------------------------------------------
	// Misc
	// -------------------------------------------------------------------------

	private parse(): ParsedTimestamp {
		return (this._parsedCache ??= parseTimestampMultiRoot({
			allUnits: this.calendar.units,
			timestamp: this.timestamp + this.originTime,
		}))
	}

	private get originTime(): number {
		return this.calendar.originTime
	}

	private bucketOf(unit: { displayName?: string | null; name: string }): string {
		return (unit.displayName ?? unit.name).toLowerCase()
	}

	private sameBucket(
		a: { displayName?: string | null; name: string },
		b: { displayName?: string | null; name: string },
	): boolean {
		return this.bucketOf(a) === this.bucketOf(b)
	}
}
