import * as fs from 'fs'
import * as jwt from 'jsonwebtoken'

type TokenPayload = {
	id: string
	email: string
}

export const TokenService = {
	getSecretKey: () => {
		if (fs.existsSync('/run/secrets/jwt-secret')) {
			return fs.readFileSync('/run/secrets/jwt-secret', 'utf8')
		}
		if (process.env.JWT_SECRET) {
			return process.env.JWT_SECRET
		}
		throw new Error('JWT_SECRET is not defined!')
	},

	decodeJwtToken: (token: string): TokenPayload => {
		return jwt.verify(token, TokenService.getSecretKey()) as TokenPayload
	},
}
