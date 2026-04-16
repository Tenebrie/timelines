import { useAuth } from 'moonflower'
import { Router } from 'moonflower/router/Router'

import { UserAuthenticator } from './auth/UserAuthenticator.js'

export const UserAuthMiddleware = async (
	ctx: Parameters<Parameters<InstanceType<typeof Router>['with']>[0]>[0],
) => {
	const user = await useAuth(ctx, UserAuthenticator)
	return {
		user,
	}
}
