import { act } from 'react-dom/test-utils'

import { renderHookWithProviders } from '../jest/renderWithProviders'
import { MockedRouter, mockRouter, resetMockRouter } from './router.mock'
import { useBaseRouter } from './useBaseRouter'

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

	it('preserves URL param between navigations', () => {
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
		expect(MockedRouter.navigations[1].target).toEqual('/app/test2?q=foobar')
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
})
