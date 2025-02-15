import { createRootRouteWithContext } from '@tanstack/react-router'

import App from '@/app/App'
import { RouterContext } from '@/router'

export const Route = createRootRouteWithContext<RouterContext>()({
	component: AppComponent,
})

function AppComponent() {
	return <App />
}

export const RootRoute = Route
