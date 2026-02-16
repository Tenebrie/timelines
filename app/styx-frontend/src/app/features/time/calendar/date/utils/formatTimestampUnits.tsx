import { CalendarDraftUnit, CalendarUnit } from '@api/types/calendarTypes'

import { ParsedTimestamp, ParsedTimestampEntry } from '../types'

export function formatTimestampUnits(
	allUnits: CalendarUnit[] | CalendarDraftUnit[],
	parsed: ParsedTimestamp,
	dateFormat: string,
) {
	if (!dateFormat || dateFormat?.trim().length === 0) {
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

		const formatHasBothCases =
			dateFormat.includes(current.symbol.toLowerCase()) && dateFormat.includes(current.symbol.toUpperCase())
		const multipleUnitsShareLetter =
			allUnits.filter((u) => u.formatShorthand?.toLowerCase() === current.symbol.toLowerCase()).length > 1
		const caseSensitive = formatHasBothCases || multipleUnitsShareLetter
		const unit = allUnits.find((u) => {
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

	for (const char of dateFormat) {
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
