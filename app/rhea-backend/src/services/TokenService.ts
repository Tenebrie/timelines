import { User } from '@prisma/client'
import * as jwt from 'jsonwebtoken'

type TokenPayload = {
	id: string
	email: string
}

export const TokenService = {
	getSecretKey: () => 'secretkey',

	generateJwtToken: (user: User): string => {
		const payload: TokenPayload = {
			id: user.id,
			email: user.email,
		}
		return jwt.sign(payload, TokenService.getSecretKey())
	},

	decodeJwtToken: (token: string): TokenPayload => {
		return jwt.verify(token, TokenService.getSecretKey()) as TokenPayload
	},
}
