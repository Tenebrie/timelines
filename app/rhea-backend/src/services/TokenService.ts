import type { User } from '@prisma/client'
import * as fs from 'fs'
import * as jwt from 'jsonwebtoken'

type TokenPayload = {
	id: string
	email: string
}

let cachedKey: string | null = null

export const TokenService = {
	getSecretKey: () => {
		if (cachedKey) {
			return cachedKey
		}
		if (fs.existsSync('/run/secrets/jwt-secret')) {
			const key = fs.readFileSync('/run/secrets/jwt-secret', 'utf8')
			cachedKey = key
			return key
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
