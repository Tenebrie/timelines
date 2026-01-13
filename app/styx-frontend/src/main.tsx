import './main.css'

import { RouterProvider } from '@tanstack/react-router'
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
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
	<React.StrictMode>
		<ReduxProvider store={store}>
			<ErrorBoundary FallbackComponent={DevErrorFallback}>
				<RouterWrapper />
			</ErrorBoundary>
		</ReduxProvider>
	</React.StrictMode>,
)

function DevErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
	return (
		<div style={{ padding: 20, color: 'red' }}>
			<h2>Dev Error</h2>
			<pre>{error.message}</pre>
			<button onClick={resetErrorBoundary}>Retry</button>
		</div>
	)
}
