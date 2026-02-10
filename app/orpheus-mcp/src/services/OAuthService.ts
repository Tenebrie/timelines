import crypto from 'crypto'

// In-memory store for OAuth flow (for production, consider Redis or DB)
// These are short-lived, so in-memory is fine for most cases
const authorizationCodes = new Map<string, { userId: string; codeChallenge: string; expiresAt: number }>()
const accessTokens = new Map<string, { userId: string; expiresAt: number }>()
const registeredClients = new Map<string, { clientName: string; redirectUris: string[] }>()

// Clean up expired entries periodically
setInterval(() => {
	const now = Date.now()
	for (const [code, data] of authorizationCodes) {
		if (data.expiresAt < now) authorizationCodes.delete(code)
	}
	for (const [token, data] of accessTokens) {
		if (data.expiresAt < now) accessTokens.delete(token)
	}
}, 60000) // Clean every minute

export const OAuthService = {
	loginEnforced: (): boolean => {
		return process.env.REQUIRE_OAUTH !== 'false'
	},

	/**
	 * Register a new OAuth client (RFC 7591 Dynamic Client Registration)
	 */
	registerClient: (clientName: string, redirectUris: string[]): string => {
		const clientId = crypto.randomUUID()
		registeredClients.set(clientId, { clientName, redirectUris })
		console.log(`Registered new OAuth client: ${clientId} (${clientName})`)
		return clientId
	},

	/**
	 * Validate that a client_id is registered
	 */
	isClientRegistered: (clientId: string): boolean => {
		return registeredClients.has(clientId)
	},

	/**
	 * Generate an authorization code for PKCE flow
	 */
	createAuthorizationCode: (userId: string, codeChallenge: string): string => {
		const code = crypto.randomUUID()
		authorizationCodes.set(code, {
			userId,
			codeChallenge,
			expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
		})
		return code
	},

	/**
	 * Exchange authorization code for access token (with PKCE verification)
	 */
	exchangeCodeForToken: (code: string, codeVerifier: string): string | null => {
		const authData = authorizationCodes.get(code)
		if (!authData) return null
		if (authData.expiresAt < Date.now()) {
			authorizationCodes.delete(code)
			return null
		}

		// Verify PKCE code_verifier against stored code_challenge (S256 method)
		const computedChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')

		if (computedChallenge !== authData.codeChallenge) {
			console.error('PKCE verification failed')
			return null
		}

		// Clean up used code
		authorizationCodes.delete(code)

		// Generate access token
		const accessToken = crypto.randomUUID()
		accessTokens.set(accessToken, {
			userId: authData.userId,
			expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
		})

		return accessToken
	},

	/**
	 * Validate an access token and return the user ID
	 */
	validateToken: (token: string): string | null => {
		const tokenData = accessTokens.get(token)
		if (!tokenData) return null
		if (tokenData.expiresAt < Date.now()) {
			accessTokens.delete(token)
			return null
		}
		return tokenData.userId
	},

	/**
	 * Revoke an access token
	 */
	revokeToken: (token: string): void => {
		accessTokens.delete(token)
	},
}
