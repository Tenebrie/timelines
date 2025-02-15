import { act, Queries, queries, render, renderHook, RenderHookOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { createBrowserRouter, MemoryRouter, RouterProvider } from 'react-router-dom'

import { generateStore, RootState } from '../app/store'
import { routerDefinition } from '../router/routerDefinition'
import { appRoutes } from '../router/routes/appRoutes'
import { worldTimelineRoutes } from '../router/routes/featureRoutes/worldTimelineRoutes'

export const renderWithProviders = (
	node: ReactNode,
	{ preloadedState }: { preloadedState?: Partial<RootState> } = {},
) => {
	const store = generateStore({ preloadedState })
	return {
		user: userEvent.setup(),
		store,
		...render(
			<ReduxProvider store={store}>
				<MemoryRouter>{node}</MemoryRouter>
			</ReduxProvider>,
		),
	}
}

export const renderWithRouter = async (
	routeName: keyof typeof appRoutes | keyof typeof worldTimelineRoutes,
	{ preloadedState }: { preloadedState?: Partial<RootState> } = {},
) => {
	const bigRouter = {
		...appRoutes,
		...worldTimelineRoutes,
	}
	const path = bigRouter[routeName]
	window.history.pushState({}, 'Test page', path)
	const store = generateStore({ preloadedState })

	const returnValue = {
		user: userEvent.setup(),
		store,
		...render(
			<ReduxProvider store={store}>
				<RouterProvider router={createBrowserRouter(routerDefinition)} />
			</ReduxProvider>,
		),
	}

	await act(async () => {
		await vi.dynamicImportSettled()
	})

	return returnValue
}

export const renderHookWithProviders = <
	Result,
	Props,
	Q extends Queries = typeof queries,
	Container extends Element | DocumentFragment = HTMLElement,
	BaseElement extends Element | DocumentFragment = Container,
>(
	render: (initialProps: Props) => Result,
	{
		preloadedState,
		...options
	}: RenderHookOptions<Props, Q, Container, BaseElement> & { preloadedState?: Partial<RootState> } = {},
) => {
	const store = generateStore({ preloadedState })
	return renderHook(render, {
		...options,
		wrapper: ({ children }) => (
			<ReduxProvider store={store}>
				<MemoryRouter>{children}</MemoryRouter>
			</ReduxProvider>
		),
	})
}
