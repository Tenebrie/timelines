import { getPrismaClient } from '@src/services/dbClients/DatabaseClient'
import { TokenService } from '@src/services/TokenService'
import { ParameterizedContext } from 'koa'
import { NonEmptyStringValidator, RequiredParam, UnauthorizedError, useCookieParams } from 'moonflower'

export const AUTH_COOKIE_NAME = 'user-jwt-token'

export const UserAuthenticator = async (ctx: ParameterizedContext) => {
	const { [AUTH_COOKIE_NAME]: token } = useCookieParams(ctx, {
		[AUTH_COOKIE_NAME]: RequiredParam(NonEmptyStringValidator),
	})

	try {
		const tokenPayload = TokenService.decodeJwtToken(token)
		const user = await getPrismaClient().user.findFirst({
			where: {
				id: tokenPayload.id,
			},
		})
		if (!user) {
			throw new UnauthorizedError('Invalid auth token')
		}
		return user
	} catch {
		throw new UnauthorizedError('Invalid auth token')
	}
}
