import './main.css'

import { RouterProvider } from '@tanstack/react-router'
import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'

import { useAuthCheck } from './app/features/auth/hooks/useAuthCheck'
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
	<ReduxProvider store={store}>
		<RouterWrapper />
	</ReduxProvider>,
)
