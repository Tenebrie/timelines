// @ts-nocheck
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { act, render, renderHook, RenderHookOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'

import { routeTree } from '@/routeTree.gen'

import { generateStore, RootState } from '../app/store'

// Create a test router instance that uses your routeTree.
const createTestRouter = () => {
	return createRouter({
		routeTree,
		// Optionally add any other test-specific options.
		defaultPreload: 'intent',
	})
}

export const renderWithProviders = (
	node: ReactNode,
	{ preloadedState }: { preloadedState?: Partial<RootState> } = {},
) => {
	const store = generateStore({ preloadedState })
	const router = createTestRouter()
	return {
		user: userEvent.setup(),
		store,
		...render(
			<ReduxProvider store={store}>
				<RouterProvider router={router}>{node}</RouterProvider>
			</ReduxProvider>,
		),
	}
}

// If you need to render a page at a given route, you can push a URL first.
export const renderWithRouter = async (
	path: string, // pass in the path you want to test
	{ preloadedState }: { preloadedState?: Partial<RootState> } = {},
) => {
	window.history.pushState({}, 'Test page', path)
	const store = generateStore({ preloadedState })
	const router = createTestRouter()
	const returnValue = {
		user: userEvent.setup(),
		store,
		...render(
			<ReduxProvider store={store}>
				<RouterProvider router={router} />
			</ReduxProvider>,
		),
	}

	await act(async () => {
		// Wait for any async router preloading, if needed.
	})

	return returnValue
}

export const renderHookWithProviders = <Result, Props>(
	hook: (initialProps: Props) => Result,
	{ preloadedState, ...options }: RenderHookOptions<Props> & { preloadedState?: Partial<RootState> } = {},
) => {
	const store = generateStore({ preloadedState })
	const router = createTestRouter()
	return renderHook(hook, {
		...options,
		wrapper: ({ children }) => (
			<ReduxProvider store={store}>
				<RouterProvider router={router}>{children}</RouterProvider>
			</ReduxProvider>
		),
	})
}
