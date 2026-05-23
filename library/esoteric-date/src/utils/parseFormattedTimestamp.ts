import { CalendarDraftUnit, CalendarUnit } from '@api/types/calendarTypes'

import { InputParsedTimestamp } from '../types'

type AnyUnit = CalendarUnit | CalendarDraftUnit

interface LabelTarget {
	unitId: string
	value: number
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function bucketKey(unit: AnyUnit): string {
	return unit.displayName ?? unit.name
}

function buildLabelTargets(allUnits: AnyUnit[]): Map<string, Map<string, LabelTarget>> {
	const unitById = new Map(allUnits.map((u) => [u.id, u]))
	const byBucket = new Map<string, Map<string, LabelTarget>>()

	for (const parent of allUnits) {
		const bucketCounter = new Map<string, number>()
		for (const rel of parent.children) {
			const child = unitById.get(rel.childUnitId)
			if (!child || child.formatMode === 'Hidden') {
				continue
			}
			const key = bucketKey(child)
			const start = bucketCounter.get(key) ?? 0
			if (rel.label) {
				let labels = byBucket.get(key)
				if (!labels) {
					labels = new Map()
					byBucket.set(key, labels)
				}
				labels.set(rel.label, { unitId: child.id, value: start })
			}
			bucketCounter.set(key, start + rel.repeats)
		}
	}

	return byBucket
}

export function parseFormattedTimestamp({
	allUnits,
	formatted,
	dateFormat,
}: {
	allUnits: AnyUnit[]
	formatted: string
	dateFormat: string
}): InputParsedTimestamp {
	const labelTargets = buildLabelTargets(allUnits)
	const slots: { unit: AnyUnit; symbolCount: number; labels?: Map<string, LabelTarget> }[] = []
	let pattern = '^'

	const appendUnit = (unit: AnyUnit, symbolCount: number) => {
		// Hidden units render to an empty string — nothing to capture.
		if (unit.formatMode === 'Hidden') {
			return
		}

		// `formatTimestampUnits` left-pads the absolute value to `symbolCount`
		// digits but never truncates, so the field has at least that many digits.
		const numberPattern = `-?\\d{${symbolCount},}?`
		const isNumeric = unit.formatMode === 'Numeric' || unit.formatMode === 'NumericOneIndexed'
		const isSymbolic = unit.formatMode === 'Name' || unit.formatMode === 'NameOneIndexed'

		if (isNumeric) {
			pattern += `(${numberPattern})`
			slots.push({ unit, symbolCount })
		} else if (isSymbolic) {
			const prefix = symbolCount === 1 ? unit.displayNameShort : unit.displayName
			const numericForm = escapeRegExp((prefix ?? '') + ' ') + numberPattern
			const labels = labelTargets.get(bucketKey(unit))

			if (labels && labels.size > 0) {
				const labelAlternation = [...labels.keys()]
					.sort((a, b) => b.length - a.length)
					.map(escapeRegExp)
					.join('|')
				pattern += `(${labelAlternation}|${numericForm})`
				slots.push({ unit, symbolCount, labels })
			} else {
				pattern += `(${numericForm})`
				slots.push({ unit, symbolCount })
			}
		}
	}

	const flush = (symbol: string, count: number) => {
		if (symbol.length === 0) {
			return
		}

		const formatHasBothCases =
			dateFormat.includes(symbol.toLowerCase()) && dateFormat.includes(symbol.toUpperCase())
		const multipleUnitsShareLetter =
			allUnits.filter((u) => u.formatShorthand?.toLowerCase() === symbol.toLowerCase()).length > 1
		const caseSensitive = formatHasBothCases || multipleUnitsShareLetter

		const unit = allUnits.find((u) => {
			if (!u.formatShorthand) {
				return false
			}
			if (caseSensitive) {
				return u.formatShorthand === symbol
			}
			return u.formatShorthand.toLowerCase() === symbol.toLowerCase()
		})

		if (unit) {
			appendUnit(unit, count)
		} else {
			pattern += escapeRegExp(symbol.repeat(count))
		}
	}

	// Group the format string into runs of identical characters (mirrors format).
	let symbol = ''
	let count = 0
	for (const char of dateFormat) {
		if (char === symbol) {
			count += 1
		} else {
			flush(symbol, count)
			symbol = char
			count = 1
		}
	}
	flush(symbol, count)

	const match = formatted.match(new RegExp(pattern + '$'))
	if (!match) {
		throw new Error(`Cannot parse "${formatted}" using date format "${dateFormat}"`)
	}

	const result: InputParsedTimestamp = new Map()
	const seenShorthand = new Set<string>()
	slots.forEach((slot, index) => {
		const shorthand = slot.unit.formatShorthand
		// One value per shorthand: a symbol repeated in the format renders the
		// same unit twice, and resolveParsedTimestamp would double-count it.
		if (!shorthand || seenShorthand.has(shorthand)) {
			return
		}
		seenShorthand.add(shorthand)

		const captured = match[index + 1]

		const target = slot.labels?.get(captured)
		if (target) {
			result.set(target.unitId, { value: target.value, formatShorthand: shorthand })
			return
		}

		const numeric = captured.match(/-?\d+$/)
		const displayed = Number.parseInt(numeric ? numeric[0] : captured, 10)
		const isOneIndexed =
			slot.unit.formatMode === 'NumericOneIndexed' || slot.unit.formatMode === 'NameOneIndexed'
		// Undo one-indexing: non-negative values were rendered as value + 1.
		const value = isOneIndexed && displayed > 0 ? displayed - 1 : displayed

		result.set(slot.unit.id, { value, formatShorthand: shorthand })
	})

	return result
}
