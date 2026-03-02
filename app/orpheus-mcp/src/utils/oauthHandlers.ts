import http from 'http'
import createClient from 'openapi-fetch'
import { URL } from 'url'

import type { paths } from '../api/rhea-api.js'
import { OAuthService } from '../services/OAuthService.js'

const rheaClient = createClient<paths>({
	baseUrl: 'http://rhea:3000',
})

const getServerUrl = (req: http.IncomingMessage): string => {
	const proto = req.headers['x-forwarded-proto'] || 'http'
	const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3002'
	return `${proto}://${host}`
}

const parseBody = async (req: http.IncomingMessage): Promise<URLSearchParams> => {
	return new Promise((resolve) => {
		let body = ''
		req.on('data', (chunk) => (body += chunk))
		req.on('end', () => resolve(new URLSearchParams(body)))
	})
}

const parseJsonBody = async (req: http.IncomingMessage): Promise<Record<string, unknown>> => {
	return new Promise((resolve, reject) => {
		let body = ''
		req.on('data', (chunk) => (body += chunk))
		req.on('end', () => {
			try {
				resolve(body ? JSON.parse(body) : {})
			} catch {
				reject(new Error('Invalid JSON'))
			}
		})
	})
}

const jsonResponse = (res: http.ServerResponse, status: number, data: object) => {
	res.writeHead(status, { 'Content-Type': 'application/json' })
	res.end(JSON.stringify(data))
}

/**
 * OAuth 2.1 Metadata endpoint (RFC 8414)
 * Claude uses this to discover OAuth endpoints
 */
export const handleOAuthMetadata = (req: http.IncomingMessage, res: http.ServerResponse) => {
	const serverUrl = getServerUrl(req)

	jsonResponse(res, 200, {
		issuer: serverUrl,
		authorization_endpoint: `${serverUrl}/authorize`,
		token_endpoint: `${serverUrl}/token`,
		registration_endpoint: `${serverUrl}/register`,
		token_endpoint_auth_methods_supported: ['none'],
		response_types_supported: ['code'],
		grant_types_supported: ['authorization_code'],
		code_challenge_methods_supported: ['S256'],
		scopes_supported: ['mcp'],
	})
}

/**
 * Authorization endpoint - shows a simple login/consent page
 */
export const handleAuthorize = (req: http.IncomingMessage, res: http.ServerResponse) => {
	const url = new URL(req.url || '/', `http://localhost`)
	const clientId = url.searchParams.get('client_id')
	const redirectUri = url.searchParams.get('redirect_uri')
	const state = url.searchParams.get('state')
	const codeChallenge = url.searchParams.get('code_challenge')
	const codeChallengeMethod = url.searchParams.get('code_challenge_method')

	// Validate required parameters
	if (!clientId || !redirectUri || !codeChallenge) {
		jsonResponse(res, 400, { error: 'invalid_request', error_description: 'Missing required parameters' })
		return
	}

	if (!OAuthService.validateRedirectUri(clientId, redirectUri)) {
		jsonResponse(res, 400, {
			error: 'invalid_client',
		})
		return
	}

	if (codeChallengeMethod !== 'S256') {
		jsonResponse(res, 400, {
			error: 'invalid_request',
			error_description: 'Only S256 code challenge method is supported',
		})
		return
	}

	const html = getLoginPageHtml({ clientId, redirectUri, state, codeChallenge })
	res.writeHead(200, { 'Content-Type': 'text/html' })
	res.end(html)
}

/**
 * Handle POST to authorization endpoint (form submission with login)
 */
export const handleAuthorizePost = async (req: http.IncomingMessage, res: http.ServerResponse) => {
	const body = await parseBody(req)
	const email = body.get('email')
	const password = body.get('password')
	const redirectUri = body.get('redirect_uri')
	const state = body.get('state')
	const codeChallenge = body.get('code_challenge')
	const clientId = body.get('client_id')

	if (!email || !password || !redirectUri || !codeChallenge || !clientId) {
		jsonResponse(res, 400, { error: 'invalid_request' })
		return
	}

	// Authenticate via Rhea's login endpoint
	const loginResponse = await rheaClient.POST('/api/auth/login', {
		body: { email, password },
	})

	if (loginResponse.error || !loginResponse.data) {
		// Show error page with login form again
		const html = getLoginPageHtml({
			clientId,
			redirectUri,
			state,
			codeChallenge,
			errorMessage: 'Invalid email or password. Please try again.',
		})
		res.writeHead(200, { 'Content-Type': 'text/html' })
		res.end(html)
		return
	}

	// Login successful - create authorization code with the real user ID
	const userId = loginResponse.data.user.id
	const code = OAuthService.createAuthorizationCode({
		userId,
		codeChallenge,
		clientId,
		redirectUri,
	})
	const redirectUrl = new URL(redirectUri)
	redirectUrl.searchParams.set('code', code)
	if (state) redirectUrl.searchParams.set('state', state)

	res.writeHead(302, { Location: redirectUrl.toString() })
	res.end()
}

/**
 * Token endpoint - exchanges authorization code for access token
 */
export const handleToken = async (req: http.IncomingMessage, res: http.ServerResponse) => {
	const body = await parseBody(req)
	const grantType = body.get('grant_type')
	const code = body.get('code')
	const codeVerifier = body.get('code_verifier')
	const clientId = body.get('client_id')
	const redirectUri = body.get('redirect_uri')

	// Validate grant type
	if (grantType !== 'authorization_code') {
		jsonResponse(res, 400, { error: 'unsupported_grant_type' })
		return
	}

	// Validate required parameters
	if (!code || !codeVerifier || !clientId || !redirectUri) {
		jsonResponse(res, 400, {
			error: 'invalid_request',
			error_description: 'Missing code, code_verifier, client_id, or redirect_uri',
		})
		return
	}

	// Exchange code for token
	const accessToken = OAuthService.exchangeCodeForToken({
		code,
		codeVerifier,
		clientId,
		redirectUri,
	})
	if (!accessToken) {
		jsonResponse(res, 400, {
			error: 'invalid_grant',
			error_description: 'Invalid or expired authorization code',
		})
		return
	}

	jsonResponse(res, 200, {
		access_token: accessToken,
		token_type: 'Bearer',
		expires_in: 86400, // 24 hours
		scope: 'mcp',
	})
}

/**
 * Extract and validate Bearer token from request
 */
export const validateBearerToken = (req: http.IncomingMessage): string | null => {
	const authHeader = req.headers.authorization
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return null
	}
	const token = authHeader.slice(7)
	return OAuthService.validateToken(token)
}

/**
 * Dynamic Client Registration endpoint (RFC 7591)
 * Allows MCP clients to register dynamically without pre-registration
 */
export const handleRegister = async (req: http.IncomingMessage, res: http.ServerResponse) => {
	try {
		const body = await parseJsonBody(req)

		// Extract client metadata from request
		const clientName = (body.client_name as string) || 'MCP Client'
		const redirectUris = (body.redirect_uris as string[]) || []

		// Generate a client_id for this registration
		const clientId = OAuthService.registerClient(clientName, redirectUris)

		// Return the registered client information (RFC 7591 Section 3.2.1)
		jsonResponse(res, 201, {
			client_id: clientId,
			client_name: clientName,
			redirect_uris: redirectUris,
			token_endpoint_auth_method: 'none',
			grant_types: ['authorization_code'],
			response_types: ['code'],
		})
	} catch {
		jsonResponse(res, 400, {
			error: 'invalid_client_metadata',
			error_description: 'Invalid registration request',
		})
	}
}

function getLoginPageHtml({
	clientId,
	redirectUri,
	state,
	codeChallenge,
	errorMessage,
}: {
	clientId: string
	redirectUri: string
	state: string | null
	codeChallenge: string
	errorMessage?: string
}): string {
	const escapeHtml = (s: string) =>
		s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

	return `
<!DOCTYPE html>
<html>
<head>
	<title>Authorize MCP Access</title>
	<style>
		body { font-family: system-ui; max-width: 400px; margin: 100px auto; padding: 20px; }
		input { width: 100%; padding: 10px; margin: 10px 0; box-sizing: border-box; }
		button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; cursor: pointer; }
		button:hover { background: #0056b3; }
		.error { color: #dc3545; margin-bottom: 10px; }
	</style>
</head>
<body>
	<h2>Authorize MCP Access</h2>
	${errorMessage ? `<div class="error">${escapeHtml(errorMessage)}</div>` : ''}
	<p>Your agent is requesting access to your Timelines data. Please log in to authorize.</p>
	<form method="POST" action="/authorize">
		<input type="hidden" name="client_id" value="${escapeHtml(clientId)}">
		<input type="hidden" name="redirect_uri" value="${escapeHtml(redirectUri)}">
		<input type="hidden" name="state" value="${escapeHtml(state || '')}">
		<input type="hidden" name="code_challenge" value="${escapeHtml(codeChallenge)}">
		<input type="email" name="email" placeholder="Email" required>
		<input type="password" name="password" placeholder="Password" required>
		<button type="submit">Log in & Authorize</button>
	</form>
</body>
</html>
`
}
