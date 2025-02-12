import './main.css'

import { ErrorBoundary, Provider as RollbarProvider } from '@rollbar/react'
import { RouterProvider } from '@tanstack/react-router'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import { Configuration } from 'rollbar'

import { useAuthCheck } from './app/features/auth/authCheck/useAuthCheck'
import { store } from './app/store'
import { router } from './router'

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
