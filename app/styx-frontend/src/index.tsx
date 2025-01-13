import './index.css'

import { ErrorBoundary, Provider as RollbarProvider } from '@rollbar/react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { Configuration } from 'rollbar'

import { store } from './app/store'
import { router } from './router/routerDefinition'

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

root.render(
	<React.StrictMode>
		<ReduxProvider store={store}>
			<RollbarProvider config={rollbarConfig}>
				<ErrorBoundary>
					<RouterProvider router={router} />
				</ErrorBoundary>
			</RollbarProvider>
		</ReduxProvider>
	</React.StrictMode>,
)
