import type { User } from '@prisma/client'
import * as jwt from 'jsonwebtoken'

import { SecretService } from './SecretService'

type TokenPayload = {
	id: string
	email: string
}

export const TokenService = {
	generateJwtToken: (user: Pick<User, 'id' | 'email'>): string => {
		const payload: TokenPayload = {
			id: user.id,
			email: user.email,
		}
		return jwt.sign(payload, SecretService.getSecret('jwt-secret'))
	},

	decodeJwtToken: (token: string): TokenPayload => {
		return jwt.verify(token, SecretService.getSecret('jwt-secret')) as TokenPayload
	},
}
