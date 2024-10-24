import { User } from '@prisma/client'
import * as fs from 'fs'
import * as jwt from 'jsonwebtoken'

type TokenPayload = {
	id: string
	email: string
}

export const TokenService = {
	getSecretKey: () => {
		if (fs.existsSync('/run/secrets/jwt-secret')) {
			console.log(fs.readFileSync('/run/secrets/jwt-secret', 'utf8').split('=')[1])
			return fs.readFileSync('/run/secrets/jwt-secret', 'utf8').split('=')[1]
		}
		if (process.env.JWT_SECRET) {
			return process.env.JWT_SECRET
		}
		throw new Error('JWT_SECRET is not defined!')
	},

	generateJwtToken: (user: Pick<User, 'id' | 'email'>): string => {
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
