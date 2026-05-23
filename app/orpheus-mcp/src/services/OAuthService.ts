import crypto from 'crypto'

import { RedisService } from './RedisService.js'

const AUTH_CODE_TTL_SECONDS = 10 * 60 // 10 minutes
const ACCESS_TOKEN_TTL_SECONDS = 24 * 60 * 60 // 24 hours

const clientKey = (clientId: string) => `orpheus:oauth:client:${clientId}`
const codeKey = (code: string) => `orpheus:oauth:code:${code}`
const tokenKey = (token: string) => `orpheus:oauth:token:${token}`

interface RegisteredClient {
	clientName: string
	redirectUris: string[]
}

interface AuthorizationCode {
	userId: string
	codeChallenge: string
	clientId: string
	redirectUri: string
}

interface AccessToken {
	userId: string
}

export const OAuthService = {
	loginEnforced: (): boolean => {
		return process.env.REQUIRE_OAUTH !== 'false'
	},

	validateRedirectUri: async (clientId: string, redirectUri: string): Promise<boolean> => {
		const client = await RedisService.get(clientKey(clientId))
		if (!client) {
			return false
		}
		return (JSON.parse(client) as RegisteredClient).redirectUris.includes(redirectUri)
	},

	registerClient: async (clientName: string, redirectUris: string[]): Promise<string> => {
		const clientId = crypto.randomUUID()
		const client: RegisteredClient = { clientName, redirectUris }
		await RedisService.set(clientKey(clientId), JSON.stringify(client))
		console.info(`Registered new OAuth client: ${clientId} (${clientName})`)
		return clientId
	},

	isClientRegistered: async (clientId: string): Promise<boolean> => {
		return (await RedisService.get(clientKey(clientId))) !== null
	},

	createAuthorizationCode: async ({
		userId,
		codeChallenge,
		clientId,
		redirectUri,
	}: AuthorizationCode): Promise<string> => {
		const code = crypto.randomUUID()
		const data: AuthorizationCode = { userId, codeChallenge, clientId, redirectUri }
		await RedisService.set(codeKey(code), JSON.stringify(data), AUTH_CODE_TTL_SECONDS)
		return code
	},

	exchangeCodeForToken: async ({
		code,
		codeVerifier,
		clientId,
		redirectUri,
	}: {
		code: string
		codeVerifier: string
		clientId: string
		redirectUri: string
	}): Promise<string | null> => {
		const raw = await RedisService.get(codeKey(code))
		if (!raw) {
			return null
		}
		const authData = JSON.parse(raw) as AuthorizationCode

		if (authData.clientId !== clientId || authData.redirectUri !== redirectUri) {
			return null
		}

		// Verify PKCE code_verifier against stored code_challenge (S256 method)
		const computedChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
		if (computedChallenge !== authData.codeChallenge) {
			console.error('PKCE verification failed')
			return null
		}

		// Authorization codes are single-use
		await RedisService.del(codeKey(code))

		const accessToken = crypto.randomUUID()
		const tokenData: AccessToken = { userId: authData.userId }
		await RedisService.set(tokenKey(accessToken), JSON.stringify(tokenData), ACCESS_TOKEN_TTL_SECONDS)

		return accessToken
	},

	validateToken: async (token: string): Promise<string | null> => {
		const raw = await RedisService.get(tokenKey(token))
		if (!raw) {
			return null
		}
		return (JSON.parse(raw) as AccessToken).userId
	},

	revokeToken: async (token: string): Promise<void> => {
		await RedisService.del(tokenKey(token))
	},
}
