import { SecretService } from '@src/ts-shared/node/services/SecretService.js'
import { ServiceTokenPayload } from '@src/ts-shared/node/types/ServiceTokenPayload.js'
import { UserTokenPayload } from '@src/ts-shared/node/types/UserTokenPayload.js'
import jwt from 'jsonwebtoken'

export const TokenService = {
	decodeUserToken: (token: string): UserTokenPayload => {
		return jwt.verify(token, SecretService.getSecret('jwt-secret')) as UserTokenPayload
	},

	decodeServiceToken: (token: string): ServiceTokenPayload => {
		const payload = jwt.verify(token, SecretService.getSecret('jwt-secret')) as ServiceTokenPayload
		if (payload.service !== 'rhea' && payload.service !== 'calliope' && payload.service !== 'orpheus') {
			throw new Error('Invalid service token')
		}
		return payload
	},

	cachedServiceToken: null as string | null,
	produceServiceToken: (): string => {
		if (TokenService.cachedServiceToken) {
			return TokenService.cachedServiceToken
		}

		const payload: ServiceTokenPayload = {
			id: 'calliope',
			email: 'calliope@localhost',
			service: 'calliope',
		}
		const token = jwt.sign(payload, SecretService.getSecret('jwt-secret'), { expiresIn: '365d' })
		TokenService.cachedServiceToken = token
		return token
	},
}
