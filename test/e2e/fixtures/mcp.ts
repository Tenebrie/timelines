import { expect, Page } from '@playwright/test'
import { createHash, randomBytes } from 'crypto'
import { makeUrl } from 'tests/utils'

type McpToolResult = {
	isError?: boolean
	content: Array<{ type: string; text: string }>
}

/**
 * Sets up a fully authenticated MCP session via OAuth 2.1 with PKCE.
 * Returns a helper object with `callTool` for invoking MCP tools against the real backend.
 */
export const createMcpSession = async (page: Page, user: { email: string; password: string }) => {
	const redirectUri = 'http://localhost:9999/oauth/callback'

	// Discover OAuth metadata
	const metadataResponse = await page.request.get(makeUrl('/.well-known/oauth-authorization-server'))
	expect(metadataResponse.ok()).toBeTruthy()

	// Register a dynamic OAuth client
	const registerResponse = await page.request.post(makeUrl('/register'), {
		data: {
			client_name: 'E2E Test Client',
			redirect_uris: [redirectUri],
		},
	})
	expect(registerResponse.ok()).toBeTruthy()
	const clientData = await registerResponse.json()
	const clientId = clientData.client_id as string

	// Generate PKCE values
	const codeVerifier = randomBytes(32).toString('base64url')
	const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')
	const state = randomBytes(16).toString('hex')

	// Authorize via form submission (capture redirect)
	const formResponse = await page.request.post(makeUrl('/authorize'), {
		form: {
			email: user.email,
			password: user.password,
			redirect_uri: redirectUri,
			state,
			code_challenge: codeChallenge,
			client_id: clientId,
		},
		maxRedirects: 0,
	})
	const locationHeader = formResponse.headers()['location']
	expect(locationHeader).toBeTruthy()
	const capturedUrl = new URL(locationHeader)
	const authorizationCode = capturedUrl.searchParams.get('code')
	expect(authorizationCode).toBeTruthy()

	// Exchange code for token
	const tokenResponse = await page.request.post(makeUrl('/token'), {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		data: new URLSearchParams({
			grant_type: 'authorization_code',
			code: authorizationCode!,
			code_verifier: codeVerifier,
			client_id: clientId,
			redirect_uri: redirectUri,
		}).toString(),
	})
	expect(tokenResponse.ok()).toBeTruthy()
	const tokenData = await tokenResponse.json()
	const accessToken = tokenData.access_token as string

	const mcpHeaders = {
		Authorization: `Bearer ${accessToken}`,
		'Content-Type': 'application/json',
		Accept: 'application/json, text/event-stream',
	}

	// Initialize MCP session
	const initResponse = await page.request.post(makeUrl('/mcp'), {
		headers: mcpHeaders,
		data: {
			jsonrpc: '2.0',
			id: 1,
			method: 'initialize',
			params: {
				protocolVersion: '2025-03-26',
				capabilities: {},
				clientInfo: { name: 'e2e-test', version: '1.0.0' },
			},
		},
	})
	expect(initResponse.ok()).toBeTruthy()
	const sessionId = initResponse.headers()['mcp-session-id']
	expect(sessionId).toBeTruthy()

	// Send initialized notification
	await page.request.post(makeUrl('/mcp'), {
		headers: { ...mcpHeaders, 'mcp-session-id': sessionId },
		data: {
			jsonrpc: '2.0',
			method: 'notifications/initialized',
		},
	})

	let nextId = 2

	/**
	 * Call an MCP tool by name with the given arguments.
	 * Parses the SSE response and returns the tool result.
	 */
	const callTool = async (name: string, args?: Record<string, unknown>): Promise<McpToolResult> => {
		const response = await page.request.post(makeUrl('/mcp'), {
			headers: { ...mcpHeaders, 'mcp-session-id': sessionId },
			data: {
				jsonrpc: '2.0',
				id: nextId++,
				method: 'tools/call',
				params: {
					name,
					arguments: args,
				},
			},
		})
		expect(response.ok()).toBeTruthy()

		const sseBody = await response.text()
		const dataLine = sseBody.split('\n').find((line) => line.startsWith('data: '))
		expect(dataLine).toBeTruthy()
		const parsed = JSON.parse(dataLine!.slice('data: '.length))
		return parsed.result as McpToolResult
	}

	return { callTool }
}
