import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { createBrowserRouter, MemoryRouter, RouterProvider } from 'react-router-dom'

import { appRoutes } from '../app/features/world/router'
import { worldRoutes } from '../app/features/world/router'
import { generateStore } from '../app/store'
import { routerDefinition } from '../router/router'

export const renderWithProviders = (node: ReactNode) => {
	return {
		user: userEvent.setup(),
		...render(
			<Provider store={generateStore()}>
				<MemoryRouter>{node}</MemoryRouter>
			</Provider>
		),
	}
}

export const renderWithRouter = (routeName: keyof typeof appRoutes | keyof typeof worldRoutes) => {
	const bigRouter = {
		...appRoutes,
		...worldRoutes,
	}
	const path = bigRouter[routeName]
	window.history.pushState({}, 'Test page', path)
	return {
		user: userEvent.setup(),
		...render(
			<Provider store={generateStore()}>
				<RouterProvider router={createBrowserRouter(routerDefinition)} />
			</Provider>
		),
	}
}
