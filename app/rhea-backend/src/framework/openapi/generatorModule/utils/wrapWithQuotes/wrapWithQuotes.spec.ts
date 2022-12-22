import { wrapWithQuotes } from './wrapWithQuotes'

describe('wrapWithQuotes', () => {
	it('returns value as is if formatted correctly', () => {
		expect(wrapWithQuotes('"test"')).toEqual('"test"')
	})

	it('wraps value without quotes', () => {
		expect(wrapWithQuotes('test')).toEqual('"test"')
	})

	it('wraps value with only left double quote', () => {
		expect(wrapWithQuotes('"test')).toEqual('"test"')
	})

	it('wraps value with only right double quote', () => {
		expect(wrapWithQuotes('test"')).toEqual('"test"')
	})

	it('preserves spaces if value is quoted', () => {
		expect(wrapWithQuotes('"   test   "')).toEqual('"   test   "')
	})

	it('replaces both single quotes with double quotes', () => {
		expect(wrapWithQuotes("'test'")).toEqual('"test"')
	})

	it('replaces left single quote with double quote', () => {
		expect(wrapWithQuotes('\'test"')).toEqual('"test"')
	})

	it('replaces right single quote with double quote', () => {
		expect(wrapWithQuotes('"test\'')).toEqual('"test"')
	})

	it('replaces left single quote and adds missing right quote', () => {
		expect(wrapWithQuotes("'test")).toEqual('"test"')
	})

	it('replaces right single quote and adds missing left quote', () => {
		expect(wrapWithQuotes("test'")).toEqual('"test"')
	})
})
