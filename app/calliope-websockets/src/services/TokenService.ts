import jwt from 'jsonwebtoken'

import { SecretService } from './SecretService'

type TokenPayload = {
	id: string
	email: string
}

export const TokenService = {
	decodeJwtToken: (token: string): TokenPayload => {
		return jwt.verify(token, SecretService.getSecret('jwt-secret')) as TokenPayload
	},
}
