import { ParameterizedContext } from 'koa'
import { UnauthorizedError, useAuth } from 'moonflower'

import { UserAuthenticator } from './UserAuthenticator.js'

export const PremiumAuthenticator = async (ctx: ParameterizedContext) => {
	const user = await useAuth(ctx, UserAuthenticator)
	if (user.level !== 'Premium' && user.level !== 'Admin') {
		throw new UnauthorizedError('Premium access required')
	}
	return user
}
