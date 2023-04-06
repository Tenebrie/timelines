import * as jwt from 'jsonwebtoken'

type TokenPayload = {
	id: string
	email: string
}

export const TokenService = {
	getSecretKey: () => {
		if (!process.env.JWT_SECRET) {
			throw new Error('JWT_SECRET is not defined!')
		}
		return process.env.JWT_SECRET
	},

	decodeJwtToken: (token: string): TokenPayload => {
		return jwt.verify(token, TokenService.getSecretKey()) as TokenPayload
	},
}
