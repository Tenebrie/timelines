import { CalendarDraftUnit, CalendarUnit } from '@api/types/calendarTypes'
import { useCallback } from 'react'

type ParsedTimestamp = Map<string, ParsedTimestampEntry>
type ParsedTimestampEntry = {
	unit: CalendarUnit | CalendarDraftUnit
	value: number
	formatShorthand?: string
	customLabel?: string
}

export function useParseTimestampToUnits({ units }: { units: CalendarDraftUnit[] | CalendarUnit[] }) {
	const sumNonHiddenChildren = useCallback(
		(unit: CalendarDraftUnit | CalendarUnit) => {
			let sum = 0
			for (const childRelation of unit.children) {
				const childUnit = units.find((u) => u.id === childRelation.childUnitId)!
				if (childUnit.formatMode !== 'Hidden') {
					sum += childRelation.repeats
				} else {
					sum += sumNonHiddenChildren(childUnit) * childRelation.repeats
				}
			}
			return sum
		},
		[units],
	)

	const parseTimestamp = useCallback(
		({
			outputMap,
			skippedChildCount,
			unit,
			customLabel,
			timestamp,
			extraDuration,
		}: {
			outputMap?: ParsedTimestamp
			skippedChildCount?: Map<string, number>
			unit: CalendarDraftUnit | CalendarUnit
			customLabel?: string
			timestamp: number
			// Non-consumed duration from hidden ancestors and siblings
			extraDuration: number
		}) => {
			outputMap = outputMap ?? new Map()
			skippedChildCount = skippedChildCount ?? new Map<string, number>()

			const index = Math.floor(timestamp / Number(unit.duration))
			let remainder = timestamp % Number(unit.duration)

			// Handle negative timestamps
			if (remainder < 0) {
				remainder += Number(unit.duration)
			}

			const unitKey = unit.displayName ?? unit.name
			const franDuration = skippedChildCount.get(unitKey) ?? 0
			outputMap.set(unit.id, {
				unit,
				value: index + (unit.formatMode === 'Hidden' ? 0 : extraDuration + franDuration),
				formatShorthand: unit.formatShorthand ?? undefined,
				customLabel,
			})

			if (unit.children.length === 0) {
				return outputMap
			}

			let myExtraDuration = 0
			if (unit.formatMode === 'Hidden') {
				myExtraDuration += sumNonHiddenChildren(unit) * index
				myExtraDuration += extraDuration
			}

			for (let i = 0; i < unit.children.length; i++) {
				const childRelation = unit.children[i]
				const childUnit = units.find((u) => u.id === childRelation.childUnitId)
				if (!childUnit) {
					continue
				}
				if (remainder < Number(childUnit.duration) * childRelation.repeats) {
					return parseTimestamp({
						outputMap,
						skippedChildCount,
						unit: childUnit,
						timestamp: remainder,
						extraDuration: myExtraDuration,
						customLabel: childRelation.label ?? undefined,
					})
				}
				remainder -= Number(childUnit.duration) * childRelation.repeats
				if (childUnit.formatMode === 'Hidden') {
					myExtraDuration += childRelation.repeats * sumNonHiddenChildren(childUnit)
				} else {
					const childUnitKey = childUnit.displayName ?? childUnit.name
					skippedChildCount.set(
						childUnitKey,
						(skippedChildCount.get(childUnitKey) ?? 0) + childRelation.repeats,
					)
				}
			}
			console.error('No child unit matched for remainder', remainder)
			return outputMap
		},
		[sumNonHiddenChildren, units],
	)

	const parse = useCallback(
		({ timestamp }: { timestamp: number }) => {
			const roots = units
				.filter((u) => u.parents.length === 0)
				.map((rootUnit) => {
					const parsed = parseTimestamp({
						unit: rootUnit,
						timestamp,
						extraDuration: 0,
					})
					return {
						unit: rootUnit,
						parsed,
					}
				})
				.sort((a, b) => a.unit.position - b.unit.position)

			const seenKeys = new Set<string>()
			const combinedTimeMap: ParsedTimestamp = new Map()
			for (const root of roots) {
				for (const [key, value] of root.parsed.entries()) {
					if (!combinedTimeMap.has(key) && value.formatShorthand && !seenKeys.has(value.formatShorthand)) {
						combinedTimeMap.set(key, value)
						seenKeys.add(value.formatShorthand)
					}
				}
			}
			return combinedTimeMap
		},
		[parseTimestamp, units],
	)

	return parse
}
