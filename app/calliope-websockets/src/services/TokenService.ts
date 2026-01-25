import { SecretService } from '@src/ts-shared/node/services/SecretService.js'
import jwt from 'jsonwebtoken'

type TokenPayload = {
	id: string
	email: string
}

export const TokenService = {
	decodeJwtToken: (token: string): TokenPayload => {
		return jwt.verify(token, SecretService.getSecret('jwt-secret')) as TokenPayload
	},
}
