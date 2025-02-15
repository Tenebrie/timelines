import { redirect } from '@tanstack/react-router'

import { RouterContext } from '@/main'

export function checkUserAccess(context: RouterContext) {
	if (context.auth.isAuthenticating) {
		return
	}
	if (!context.auth.success && context.auth.redirectTo) {
		const redirectTo = {
			home: '/home' as const,
			login: '/login' as const,
			register: '/register' as const,
		}[context.auth.redirectTo]

		throw redirect({ to: redirectTo })
	}
}
