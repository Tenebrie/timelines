import { act } from 'react-dom/test-utils'

import { renderHookWithProviders } from '../jest/renderWithProviders'
import { MockedRouter, mockRouter, resetMockRouter } from './router.mock'
import { QueryStrategy, useBaseRouter } from './useBaseRouter'

describe('useBaseRouter', () => {
	beforeAll(() => {
		mockRouter('/', undefined)
	})
	afterEach(() => {
		resetMockRouter()
	})

	it('navigates to target URL with path param', () => {
		const { result } = renderHookWithProviders(() =>
			useBaseRouter({
				app: '/app/test/:param',
			})
		)

		act(() => {
			result.current.navigateTo(
				'/app/test/:param',
				{
					param: 'foobar',
				},
				{}
			)
		})

		expect(MockedRouter.navigations.length).toEqual(1)
		expect(MockedRouter.navigations[0].target).toEqual('/app/test/foobar')
	})

	it('navigates from one URL to another', () => {
		const { result } = renderHookWithProviders(() =>
			useBaseRouter({
				app: '/app/test/:param',
			})
		)

		act(() => {
			result.current.navigateTo(
				'/app/test/:param',
				{
					param: 'foobar',
				},
				{}
			)
		})
		act(() => {
			result.current.navigateTo(
				'/app/test/:param',
				{
					param: 'barfoo',
				},
				{}
			)
		})

		expect(MockedRouter.navigations.length).toEqual(2)
		expect(MockedRouter.navigations[1].target).toEqual('/app/test/barfoo')
	})

	it('navigates to target URL with query param', () => {
		const { result } = renderHookWithProviders(() =>
			useBaseRouter({
				app: '/app/test',
			})
		)

		act(() => {
			result.current.navigateTo('/app/test', {}, { q: 'foobar' })
		})

		expect(MockedRouter.navigations.length).toEqual(1)
		expect(MockedRouter.navigations[0].target).toEqual('/app/test?q=foobar')
	})

	it('navigates from one target to another with different query params', () => {
		const { result } = renderHookWithProviders(() =>
			useBaseRouter({
				app: '/app/test',
			})
		)

		act(() => {
			result.current.navigateTo('/app/test', {}, { q: 'foobar' })
		})
		act(() => {
			result.current.navigateTo('/app/test', {}, { q: 'barfoo' })
		})

		expect(MockedRouter.navigations.length).toEqual(2)
		expect(MockedRouter.navigations[1].target).toEqual('/app/test?q=barfoo')
	})

	it('preserves URL param between navigations with Preserve strategy', () => {
		const { result } = renderHookWithProviders(() =>
			useBaseRouter({
				test1: '/app/test1',
				test2: '/app/test2',
			})
		)

		act(() => {
			result.current.navigateTo('/app/test1', {}, { q: 'foobar' })
		})
		act(() => {
			result.current.navigateTo(
				'/app/test2',
				{},
				{
					q: QueryStrategy.Preserve,
				}
			)
		})

		expect(MockedRouter.navigations.length).toEqual(2)
		expect(MockedRouter.navigations[1].target).toEqual('/app/test2?q=foobar')
	})

	it('clears URL param between navigations with Clear strategy', () => {
		const { result } = renderHookWithProviders(() =>
			useBaseRouter({
				test1: '/app/test1',
				test2: '/app/test2',
			})
		)

		act(() => {
			result.current.navigateTo('/app/test1', {}, { q: 'foobar' })
		})
		act(() => {
			result.current.navigateTo(
				'/app/test2',
				{},
				{
					q: QueryStrategy.Clear,
				}
			)
		})

		expect(MockedRouter.navigations.length).toEqual(2)
		expect(MockedRouter.navigations[1].target).toEqual('/app/test2')
	})

	it('clears URL param between navigations by default', () => {
		const { result } = renderHookWithProviders(() =>
			useBaseRouter({
				test1: '/app/test1',
				test2: '/app/test2',
			})
		)

		act(() => {
			result.current.navigateTo('/app/test1', {}, { q: 'foobar' })
		})
		act(() => {
			result.current.navigateTo('/app/test2', {}, {})
		})

		expect(MockedRouter.navigations.length).toEqual(2)
		expect(MockedRouter.navigations[1].target).toEqual('/app/test2')
	})

	it('ignores identical navigation calls', () => {
		const { result } = renderHookWithProviders(() =>
			useBaseRouter({
				app: '/app/test',
			})
		)

		act(() => {
			result.current.navigateTo('/app/test', {}, { q: 'foobar' })
		})
		act(() => {
			result.current.navigateTo('/app/test', {}, { q: 'foobar' })
		})
		act(() => {
			result.current.navigateTo('/app/test', {}, { q: 'foobar' })
		})

		expect(MockedRouter.navigations.length).toEqual(1)
	})

	it('unsets the query param if set to null', () => {
		const { result } = renderHookWithProviders(() =>
			useBaseRouter({
				app: '/app/test',
			})
		)

		act(() => {
			result.current.navigateTo('/app/test', {}, { q: 'foobar' })
		})
		act(() => {
			result.current.navigateTo('/app/test', {}, { q: null })
		})

		expect(MockedRouter.navigations[1].target).toEqual('/app/test')
	})

	describe('isLocationEqual', () => {
		it('matches the correct location', () => {
			const { result } = renderHookWithProviders(() =>
				useBaseRouter({
					app: '/app/:param1/:param2/foo',
				})
			)

			act(() => {
				result.current.navigateTo(
					'/app/:param1/:param2/foo',
					{
						param1: 'foo',
						param2: 'bar',
					},
					{}
				)
			})

			expect(result.current.isLocationEqual('/app/:param1/:param2/foo')).toEqual(true)
		})

		it('does not match the incorrect location', () => {
			const { result } = renderHookWithProviders(() =>
				useBaseRouter({
					app: '/app/:param1/:param2/foo',
				})
			)

			expect(result.current.isLocationEqual('/app/:param1/:param2/foo')).toEqual(false)
		})

		it('does not match the similar location', () => {
			const { result } = renderHookWithProviders(() =>
				useBaseRouter({
					test1: '/app/:param1/:param2/foo',
					test2: '/app/:param1/:param2/bar',
				})
			)

			act(() => {
				result.current.navigateTo(
					'/app/:param1/:param2/bar',
					{
						param1: '123',
						param2: '123',
					},
					{}
				)
			})

			expect(result.current.isLocationEqual('/app/:param1/:param2/foo')).toEqual(false)
		})
	})
})
