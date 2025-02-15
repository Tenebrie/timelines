import { createRouter } from '@tanstack/react-router'

import { useAuthCheck } from './app/features/auth/authCheck/useAuthCheck'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
	routeTree,
	context: {
		auth: {
			isAuthenticating: false,
			success: false,
			redirectTo: undefined,
		},
	} satisfies RouterContext,
})

export type RouterContext = { auth: ReturnType<typeof useAuthCheck> }

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}
