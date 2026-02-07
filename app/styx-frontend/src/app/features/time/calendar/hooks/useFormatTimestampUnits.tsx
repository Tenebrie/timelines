import { CalendarDraftUnit, CalendarUnit } from '@api/types/calendarTypes'

import { useParseTimestampToUnits } from './useParseTimestampToUnits'

type ParsedTimestamp = Map<string, ParsedTimestampEntry>
type ParsedTimestampEntry = {
	value: number
	formatShorthand?: string
	customLabel?: string
}

export function useFormatTimestampUnits({
	units,
	dateFormatString,
	originTime = 0,
}: {
	units: (CalendarUnit | CalendarDraftUnit)[]
	dateFormatString: string
	originTime?: number
}) {
	const parse = useParseTimestampToUnits({ units })

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

		function formatUnit(
			unit: CalendarUnit | CalendarDraftUnit,
			entry: ParsedTimestampEntry,
			symbolCount: number,
		) {
			const value =
				(unit.formatMode === 'NameOneIndexed' || unit.formatMode === 'NumericOneIndexed') && entry.value >= 0
					? entry.value + 1
					: entry.value

			// Handle negative numbers: pad the absolute value, then prepend the minus sign
			const isNegative = value < 0
			const absValue = Math.abs(value)
			const paddedAbsValue = absValue.toString().padStart(symbolCount, '0')
			const paddedValue = isNegative ? '-' + paddedAbsValue : paddedAbsValue

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
		const formatted = formatParsed(parse({ timestamp: timestamp + originTime }))
		return formatted.substring(0, 1).toUpperCase() + formatted.substring(1)
	}

	return format
}
