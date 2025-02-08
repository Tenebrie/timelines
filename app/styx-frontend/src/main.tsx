import './main.css'

import { ErrorBoundary, Provider as RollbarProvider } from '@rollbar/react'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import { Configuration } from 'rollbar'

import { useAuthCheck } from './app/features/auth/authCheck/useAuthCheck'
import { store } from './app/store'
import { routeTree } from './routeTree.gen'

const container = document.getElementById('root')
const root = createRoot(container!)
export const reactRoot = root

const rollbarConfig: Configuration = {
	enabled: import.meta.env.PROD,
	accessToken: 'f426a5264860489095a22b56cc8d8e31',
	environment: import.meta.env.MODE,
	captureUncaught: true,
	captureUnhandledRejections: true,
}

export type RouterContext = { auth: ReturnType<typeof useAuthCheck> }

const router = createRouter({
	routeTree,
	context: {
		auth: {
			isAuthenticating: false,
			success: false,
			redirectTo: undefined,
		},
	} satisfies RouterContext,
})

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

const RouterWrapper = () => {
	const auth = useAuthCheck()
	return <RouterProvider router={router} context={{ auth }} />
}

root.render(
	<React.StrictMode>
		<ReduxProvider store={store}>
			<RollbarProvider config={rollbarConfig}>
				<ErrorBoundary>
					<RouterWrapper />
					{/* <TanStackRouterDevtools router={router} />  */}
				</ErrorBoundary>
			</RollbarProvider>
		</ReduxProvider>
	</React.StrictMode>,
)
