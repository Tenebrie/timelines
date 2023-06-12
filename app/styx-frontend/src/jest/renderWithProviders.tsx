import { Queries, queries, render, renderHook, RenderHookOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { createBrowserRouter, MemoryRouter, RouterProvider } from 'react-router-dom'

import { appRoutes } from '../app/features/world/router'
import { worldRoutes } from '../app/features/world/router'
import { generateStore, RootState } from '../app/store'
import { routerDefinition } from '../router/router'

export const renderWithProviders = (
	node: ReactNode,
	{ preloadedState }: { preloadedState?: Partial<RootState> } = {}
) => {
	const store = generateStore({ preloadedState })
	return {
		user: userEvent.setup(),
		store,
		...render(
			<Provider store={store}>
				<MemoryRouter>{node}</MemoryRouter>
			</Provider>
		),
	}
}

export const renderWithRouter = (
	routeName: keyof typeof appRoutes | keyof typeof worldRoutes,
	{ preloadedState }: { preloadedState?: Partial<RootState> } = {}
) => {
	const bigRouter = {
		...appRoutes,
		...worldRoutes,
	}
	const path = bigRouter[routeName]
	window.history.pushState({}, 'Test page', path)
	const store = generateStore({ preloadedState })
	return {
		user: userEvent.setup(),
		store,
		...render(
			<Provider store={store}>
				<RouterProvider router={createBrowserRouter(routerDefinition)} />
			</Provider>
		),
	}
}

export const renderHookWithProviders = <
	Result,
	Props,
	Q extends Queries = typeof queries,
	Container extends Element | DocumentFragment = HTMLElement,
	BaseElement extends Element | DocumentFragment = Container
>(
	render: (initialProps: Props) => Result,
	{
		preloadedState,
		...options
	}: RenderHookOptions<Props, Q, Container, BaseElement> & { preloadedState?: Partial<RootState> } = {}
) => {
	const store = generateStore({ preloadedState })
	return renderHook(render, {
		...options,
		wrapper: ({ children }) => (
			<Provider store={store}>
				<MemoryRouter>{children}</MemoryRouter>
			</Provider>
		),
	})
}
