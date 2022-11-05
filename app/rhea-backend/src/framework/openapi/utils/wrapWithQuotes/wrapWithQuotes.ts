export const wrapWithQuotes = (val: string) => {
	const trimmedVal = val.trim()
	if (trimmedVal.length === 0) {
		return '""'
	}
	const startsWithSingleQuote = trimmedVal[0] === "'"
	const startsWithDoubleQuote = trimmedVal[0] === '"'
	const endsWithSingleQuote = trimmedVal[trimmedVal.length - 1] === "'"
	const endsWithDoubleQuote = trimmedVal[trimmedVal.length - 1] === '"'

	if (!startsWithSingleQuote && !startsWithDoubleQuote && !endsWithSingleQuote && !endsWithDoubleQuote) {
		return `"${val}"`
	} else if (startsWithDoubleQuote && !endsWithSingleQuote && !endsWithDoubleQuote) {
		return `${val}"`
	} else if (startsWithSingleQuote && !endsWithSingleQuote && !endsWithDoubleQuote) {
		return `"${trimmedVal.substring(1)}"`
	} else if (endsWithDoubleQuote && !startsWithSingleQuote && !startsWithDoubleQuote) {
		return `"${val}`
	} else if (endsWithSingleQuote && !startsWithSingleQuote && !startsWithDoubleQuote) {
		return `"${trimmedVal.substring(0, trimmedVal.length - 1)}"`
	} else if (startsWithDoubleQuote && endsWithDoubleQuote) {
		return val
	} else if (startsWithDoubleQuote && endsWithSingleQuote) {
		return `${trimmedVal.substring(0, trimmedVal.length - 1)}"`
	} else if (startsWithSingleQuote && endsWithDoubleQuote) {
		return `"${trimmedVal.substring(1)}`
	} else if (startsWithSingleQuote && endsWithSingleQuote) {
		return `"${trimmedVal.substring(1, trimmedVal.length - 1)}"`
	}
	return trimmedVal
}
