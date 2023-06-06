import { dbClient } from '@src/services/DatabaseClient'
import { TokenService } from '@src/services/TokenService'
import { ParameterizedContext } from 'koa'
import { RequiredParam, StringValidator, UnauthorizedError, useCookieParams } from 'tenebrie-framework'

export const AUTH_COOKIE_NAME = 'user-jwt-token'

export const UserAuthenticator = async (ctx: ParameterizedContext) => {
	const { [AUTH_COOKIE_NAME]: token } = useCookieParams(ctx, {
		[AUTH_COOKIE_NAME]: RequiredParam(StringValidator),
	})

	try {
		const tokenPayload = TokenService.decodeJwtToken(token)
		const user = await dbClient.user.findFirst({
			where: {
				id: tokenPayload.id,
			},
		})
		if (!user) {
			throw new UnauthorizedError('Invalid auth token')
		}
		return user
	} catch (err) {
		throw new UnauthorizedError('Invalid auth token')
	}
}
