import './main.css'

import { RouterProvider } from '@tanstack/react-router'
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'

import { useAuthCheck } from './app/features/auth/authCheck/useAuthCheck'
import { store } from './app/store'
import { loadSafariPolyfills } from './polyfills/safariPolyfills'
import { router } from './router'

loadSafariPolyfills()

const container = document.getElementById('root')
const root = createRoot(container!)
export const reactRoot = root

const RouterWrapper = () => {
	const auth = useAuthCheck()

	useEffect(() => {
		if (!auth.success && auth.redirectTo) {
			router.navigate({ to: auth.redirectTo })
		}
	}, [auth])
	return <RouterProvider router={router} />
}

root.render(
	<React.StrictMode>
		<ReduxProvider store={store}>
			<RouterWrapper />
			{/* <TanStackRouterDevtools router={router} />  */}
		</ReduxProvider>
	</React.StrictMode>,
)
