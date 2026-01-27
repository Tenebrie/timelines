import { TokenService } from '@src/services/TokenService.js'
import { SERVICE_AUTH_TOKEN_HEADER } from '@src/ts-shared/const/constants.js'
import { ParameterizedContext } from 'koa'
import { UnauthorizedError } from 'moonflower/errors/UserFacingErrors'
import { useHeaderParams } from 'moonflower/hooks/useHeaderParams'
import { NonEmptyStringValidator } from 'moonflower/validators/BuiltInValidators'

export const ServiceAuthenticator = async (ctx: ParameterizedContext) => {
	const { serviceAuthToken } = useHeaderParams(ctx, {
		[SERVICE_AUTH_TOKEN_HEADER]: NonEmptyStringValidator,
	})

	try {
		const tokenPayload = TokenService.decodeServiceToken(serviceAuthToken)
		return {
			service: tokenPayload.service!,
		}
	} catch {
		throw new UnauthorizedError('Invalid service token')
	}
}
