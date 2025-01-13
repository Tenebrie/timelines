import { deepMerge } from './deepMerge'

describe('deepMerge', () => {
	it('merges objects', () => {
		const target = {
			foo: 'bar',
			baz: 'qux',
			test: {
				deep: 'value',
				otherDeep: 'value',
			},
		}

		const merged = deepMerge(target, {
			foo: 'baz',
			test: {
				deep: 'override',
			},
		})

		expect(merged).toEqual({
			foo: 'baz',
			baz: 'qux',
			test: {
				deep: 'override',
				otherDeep: 'value',
			},
		})
	})
})
