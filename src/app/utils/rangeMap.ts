type RangeDefinition = `${'[' | '('}${number}; ${number}${']' | ')'}` | `[${number}]`

export const rangeMap = <T>(value: number, ranges: [RangeDefinition, T][]): T | null => {
	const results = ranges.map((range) => {
		const def = range[0]

		const singleNumber = def.indexOf(';') === -1
		const singleValue = Number(def.substring(1, def.indexOf(']')))

		const leftInclusive = def.at(0) === '['
		const rightInclusive = def.at(def.length - 1) === ']'
		const leftValue = Number(def.substring(1, def.indexOf(';')))
		const rightValue = Number(
			def.substring(def.indexOf(';') + 1, rightInclusive ? def.indexOf(']') : def.indexOf(')'))
		)

		if (
			(singleNumber && value === singleValue) ||
			(leftInclusive && value === leftValue) ||
			(rightInclusive && value === rightValue) ||
			(value > leftValue && value < rightValue)
		) {
			return range
		}
		return null
	})
	const validResults = results.filter((result) => result !== null)
	if (validResults.length > 1) {
		console.warn('rangeMap: Multiple matches found', validResults)
	}
	return validResults[0] ? validResults[0][1] : null
}
