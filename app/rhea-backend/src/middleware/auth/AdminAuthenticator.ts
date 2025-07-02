import { ParameterizedContext } from 'koa'
import { UnauthorizedError, useAuth } from 'moonflower'

import { UserAuthenticator } from './UserAuthenticator.js'

export const AdminAuthenticator = async (ctx: ParameterizedContext) => {
	const user = await useAuth(ctx, UserAuthenticator)
	if (user.level !== 'Admin') {
		throw new UnauthorizedError('Elevated access required')
	}
	return user
}
