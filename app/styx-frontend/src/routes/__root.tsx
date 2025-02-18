import { createRootRouteWithContext } from '@tanstack/react-router'

import App from '@/app/App'
import { RouterContext } from '@/router'

export const Route = createRootRouteWithContext<RouterContext>()({
	component: AppComponent,
	beforeLoad: async () => {
		if (window.location.href === 'http://localhost:8080/') {
			window.location.href = 'http://localhost/'
		}
	},
})

function AppComponent() {
	return <App />
}

export const RootRoute = Route
