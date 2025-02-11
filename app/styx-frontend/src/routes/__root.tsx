import { createRootRouteWithContext } from '@tanstack/react-router'

import App from '@/app/App'
import { RouterContext } from '@/main'

export const Route = createRootRouteWithContext<RouterContext>()({
	component: App,
})

export const RootRoute = Route
