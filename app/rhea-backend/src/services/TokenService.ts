import type { User } from '@prisma/client'
import { SecretService } from '@src/ts-shared/node/services/SecretService.js'
import { ServiceTokenPayload } from '@src/ts-shared/node/types/ServiceTokenPayload.js'
import { UserTokenPayload } from '@src/ts-shared/node/types/UserTokenPayload.js'
import jwt from 'jsonwebtoken'

export const TokenService = {
	generateJwtToken: (user: Pick<User, 'id' | 'email'>): string => {
		const payload: UserTokenPayload = {
			id: user.id,
			email: user.email,
		}
		return jwt.sign(payload, SecretService.getSecret('jwt-secret'), { expiresIn: '365d' })
	},

	generateImpersonatedJwtToken: (adminId: string, user: Pick<User, 'id' | 'email'>): string => {
		const payload: UserTokenPayload = {
			id: user.id,
			email: user.email,
			impersonatingAdminId: adminId,
		}
		return jwt.sign(payload, SecretService.getSecret('jwt-secret'), { expiresIn: '365d' })
	},

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
}
