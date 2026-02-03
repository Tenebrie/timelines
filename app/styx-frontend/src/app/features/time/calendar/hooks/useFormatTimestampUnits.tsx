import { CalendarUnit } from '@api/types/calendarTypes'

type ParsedTimestamp = Map<string, ParsedTimestampEntry>
type ParsedTimestampEntry = {
	value: number
	formatShorthand?: string
	customLabel?: string
}

export function useFormatTimestampUnits({
	units,
	dateFormatString,
}: {
	units: CalendarUnit[]
	dateFormatString: string
}) {
	const sumNonHiddenChildren = (unit: CalendarUnit) => {
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
	}

	const parseTimestamp = ({
		outputMap,
		skippedChildCount,
		unit,
		customLabel,
		timestamp,
		extraDuration,
		// franDuration,
	}: {
		outputMap?: ParsedTimestamp
		skippedChildCount?: Map<string, number>
		unit: CalendarUnit
		customLabel?: string
		timestamp: number
		// Non-consumed duration from hidden ancestors and siblings
		extraDuration: number
	}) => {
		outputMap = outputMap ?? new Map()
		skippedChildCount = skippedChildCount ?? new Map<string, number>()

		const index = Math.floor(timestamp / unit.duration)
		let remainder = timestamp % unit.duration

		const franDuration = skippedChildCount.get(unit.displayName) ?? 0
		outputMap.set(unit.id, {
			value: index + (unit.formatMode === 'Hidden' ? 0 : extraDuration + franDuration),
			formatShorthand: unit.formatShorthand ?? undefined,
			customLabel,
		})

		if (unit.children.length === 0) {
			return outputMap
		}

		// let myFranDuration = 0
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
			if (remainder < childUnit.duration * childRelation.repeats) {
				return parseTimestamp({
					outputMap,
					skippedChildCount,
					unit: childUnit,
					timestamp: remainder,
					extraDuration: myExtraDuration,
					customLabel: childRelation.label ?? undefined,
				})
			}
			remainder -= childUnit.duration * childRelation.repeats
			if (childUnit.formatMode === 'Hidden') {
				myExtraDuration += childRelation.repeats * sumNonHiddenChildren(childUnit)
			} else {
				skippedChildCount.set(
					childUnit.displayName,
					(skippedChildCount.get(childUnit.displayName) ?? 0) + childRelation.repeats,
				)
			}
		}
		console.error('No child unit matched for remainder', remainder)
		return outputMap
	}

	const formatParsed = (parsed: ParsedTimestamp) => {
		if (!dateFormatString || dateFormatString?.trim().length === 0) {
			return 'No date format specified'
		}

		const current = {
			symbol: '' as string,
			count: 0,

			result: '',
		}

		const flushCurrent = () => {
			if (current.symbol.length === 0) {
				return
			}

			const caseSensitive =
				dateFormatString.includes(current.symbol.toLowerCase()) &&
				dateFormatString.includes(current.symbol.toUpperCase())
			const unit = units.find((u) => {
				if (!parsed.get(u.id)) {
					return false
				}

				if (caseSensitive) {
					return u.formatShorthand === current.symbol
				}

				return u.formatShorthand?.toLowerCase() === current.symbol.toLowerCase()
			})
			if (unit) {
				const entry = parsed.get(unit.id)
				if (entry) {
					current.result += formatUnit(unit, entry, current.count)
				}
			} else {
				current.result += current.symbol.repeat(current.count)
			}
		}

		for (const char of dateFormatString) {
			if (char === current.symbol) {
				current.count += 1
			} else {
				flushCurrent()
				current.symbol = char
				current.count = 1
			}
		}
		flushCurrent()

		function formatUnit(unit: CalendarUnit, entry: ParsedTimestampEntry, symbolCount: number) {
			const value =
				unit.formatMode === 'NameOneIndexed' || unit.formatMode === 'NumericOneIndexed'
					? entry.value + 1
					: entry.value
			const paddedValue = value.toString().padStart(symbolCount, '0')

			const isNumeric = unit.formatMode === 'Numeric' || unit.formatMode === 'NumericOneIndexed'
			const isSymbolic = unit.formatMode === 'Name' || unit.formatMode === 'NameOneIndexed'

			if (entry.customLabel && symbolCount === 1) {
				// TODO: Short label
				return entry.customLabel
			} else if (entry.customLabel && symbolCount > 1) {
				return entry.customLabel
			} else if (isSymbolic && symbolCount === 1) {
				return unit.displayNameShort + ' ' + paddedValue
			} else if (isSymbolic && symbolCount > 1) {
				return unit.displayName + ' ' + paddedValue
			} else if (isNumeric) {
				return paddedValue
			}
			return ''
		}

		return current.result
	}

	const format = ({ timestamp }: { timestamp: number }) => {
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
		const formatted = formatParsed(combinedTimeMap)
		return formatted.substring(0, 1).toUpperCase() + formatted.substring(1)
	}

	return format
}
