import { wrapWithQuotes } from '../wrapWithQuotes/wrapWithQuotes'

export const unwrapQuotes = (val: string) => {
	const wrappedValue = wrapWithQuotes(val)
	return `${wrappedValue.substring(1, wrappedValue.length - 1)}`
}
