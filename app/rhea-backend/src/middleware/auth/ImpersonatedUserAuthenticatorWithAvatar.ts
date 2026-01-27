import { getPrismaClient } from '@src/services/dbClients/DatabaseClient.js'
import { TokenService } from '@src/services/TokenService.js'
import { ParameterizedContext } from 'koa'
import { useHeaderParams } from 'moonflower'
import { UnauthorizedError } from 'moonflower/errors/UserFacingErrors'
import { NonEmptyStringValidator } from 'moonflower/validators/BuiltInValidators'

import {
	AUTH_COOKIE_NAME,
	IMPERSONATED_USER_HEADER,
	SERVICE_AUTH_TOKEN_HEADER,
} from '../../ts-shared/const/constants.js'
export { AUTH_COOKIE_NAME }

export const ImpersonatedUserAuthenticatorWithAvatar = async (ctx: ParameterizedContext) => {
	const { impersonatedUser, serviceAuthToken } = useHeaderParams(ctx, {
		[IMPERSONATED_USER_HEADER]: NonEmptyStringValidator,
		[SERVICE_AUTH_TOKEN_HEADER]: NonEmptyStringValidator,
	})

	try {
		TokenService.decodeServiceToken(serviceAuthToken)

		const user = await getPrismaClient().user.findFirst({
			where: {
				id: impersonatedUser,
				deletedAt: null,
			},
			include: {
				avatar: true,
			},
		})
		if (!user) {
			throw new UnauthorizedError('Invalid user')
		}
		return user
	} catch {
		throw new UnauthorizedError('Invalid service auth token')
	}
}
