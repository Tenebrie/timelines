import { expect, Page, test } from '@playwright/test'
import { createHash, randomBytes } from 'crypto'
import { createNewUser, deleteAccount } from 'fixtures/auth'

import { makeUrl } from '../utils'

test.describe('MCP OAuth Login', () => {
	let user: Awaited<ReturnType<typeof createNewUser>>

	test.beforeEach(async ({ page }) => {
		user = await createNewUser(page)
	})

	/**
	 * Helper to register a dynamic OAuth client and generate PKCE values
	 */
	const setupOAuthClient = async (page: Page) => {
		const redirectUri = 'http://localhost:9999/oauth/callback'

		// Step 1: Discover OAuth metadata
		const metadataResponse = await page.request.get(makeUrl('/.well-known/oauth-authorization-server'))
		expect(metadataResponse.ok()).toBeTruthy()
		const metadata = await metadataResponse.json()
		expect(metadata.authorization_endpoint).toBeTruthy()
		expect(metadata.token_endpoint).toBeTruthy()
		expect(metadata.registration_endpoint).toBeTruthy()

		// Step 2: Register a dynamic client (RFC 7591)
		const registerResponse = await page.request.post(makeUrl('/register'), {
			data: {
				client_name: 'E2E Test Client',
				redirect_uris: [redirectUri],
			},
		})
		expect(registerResponse.ok()).toBeTruthy()
		const clientData = await registerResponse.json()
		expect(clientData.client_id).toBeTruthy()

		// Step 3: Generate PKCE code_verifier and code_challenge (S256)
		const codeVerifier = randomBytes(32).toString('base64url')
		const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')
		const state = randomBytes(16).toString('hex')

		return {
			redirectUri,
			clientId: clientData.client_id as string,
			codeVerifier,
			codeChallenge,
			state,
		}
	}

	test('should complete full OAuth 2.1 login flow with PKCE', async ({ page }) => {
		const { redirectUri, clientId, codeVerifier, codeChallenge, state } = await setupOAuthClient(page)

		// Navigate to the authorization page
		const authorizeUrl = makeUrl(
			`/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256&response_type=code&scope=mcp`,
		)
		await page.goto(authorizeUrl)

		// Verify the login page is displayed
		await expect(page.locator('h2')).toHaveText('Authorize MCP Access')
		await expect(page.locator('input[name="email"]')).toBeVisible()
		await expect(page.locator('input[name="password"]')).toBeVisible()

		// Fill in the login form to verify UI works
		await page.fill('input[name="email"]', user.email)
		await page.fill('input[name="password"]', user.password)

		// Submit the form via API with maxRedirects: 0 to capture the 302 redirect.
		// The redirect goes to an external origin (localhost:9999) which doesn't exist,
		// so we capture the Location header directly instead of following it.
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

		// The response is a 302 redirect with the authorization code in the Location header
		const locationHeader = formResponse.headers()['location']
		expect(locationHeader).toBeTruthy()
		const capturedUrl = new URL(locationHeader)
		const authorizationCode = capturedUrl.searchParams.get('code')
		expect(authorizationCode).toBeTruthy()
		expect(capturedUrl.searchParams.get('state')).toBe(state)

		// Exchange the authorization code for an access token
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
		expect(tokenData.access_token).toBeTruthy()
		expect(tokenData.token_type).toBe('Bearer')
		expect(tokenData.scope).toBe('mcp')

		// Verify the token works by initializing an MCP session and calling the readme tool
		const mcpHeaders = {
			Authorization: `Bearer ${tokenData.access_token}`,
			'Content-Type': 'application/json',
			Accept: 'application/json, text/event-stream',
		}

		// Initialize the MCP session
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

		// Call the readme tool
		const readmeResponse = await page.request.post(makeUrl('/mcp'), {
			headers: { ...mcpHeaders, 'mcp-session-id': sessionId },
			data: {
				jsonrpc: '2.0',
				id: 2,
				method: 'tools/call',
				params: {
					name: 'readme',
				},
			},
		})
		expect(readmeResponse.ok()).toBeTruthy()

		// The MCP Streamable HTTP transport returns SSE (Server-Sent Events) format.
		// Parse the SSE body to extract the JSON-RPC response.
		const sseBody = await readmeResponse.text()
		const dataLine = sseBody.split('\n').find((line) => line.startsWith('data: '))
		expect(dataLine).toBeTruthy()
		const readmeData = JSON.parse(dataLine!.slice('data: '.length))
		expect(readmeData.result).toBeTruthy()
		expect(readmeData.result.content).toBeInstanceOf(Array)
		expect(readmeData.result.content.length).toBeGreaterThan(0)
		expect(readmeData.result.content[0].type).toBe('text')
		expect(readmeData.result.content[0].text).toContain('Basic overview')
	})

	test('should show error on invalid credentials', async ({ page }) => {
		const { redirectUri, clientId, codeChallenge, state } = await setupOAuthClient(page)

		// Navigate to the authorization page
		const authorizeUrl = makeUrl(
			`/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256&response_type=code&scope=mcp`,
		)
		await page.goto(authorizeUrl)

		// Fill in with wrong credentials
		await page.fill('input[name="email"]', user.email)
		await page.fill('input[name="password"]', 'WrongPassword123!')
		await page.click('button[type="submit"]')

		// Verify the error message is displayed and user stays on the login page
		await expect(page.locator('.error')).toHaveText('Invalid email or password. Please try again.')
		await expect(page.locator('h2')).toHaveText('Authorize MCP Access')
	})

	test('should reject token exchange with invalid code verifier', async ({ page }) => {
		const { redirectUri, clientId, codeChallenge, state } = await setupOAuthClient(page)

		// Navigate to the authorization page and log in
		const authorizeUrl = makeUrl(
			`/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256&response_type=code&scope=mcp`,
		)
		await page.goto(authorizeUrl)

		// Submit form via API to capture the 302 redirect without following it
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

		// Try to exchange with a wrong code_verifier (PKCE should fail)
		const wrongVerifier = randomBytes(32).toString('base64url')
		const tokenResponse = await page.request.post(makeUrl('/token'), {
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			data: new URLSearchParams({
				grant_type: 'authorization_code',
				code: authorizationCode!,
				code_verifier: wrongVerifier,
				client_id: clientId,
				redirect_uri: redirectUri,
			}).toString(),
		})
		expect(tokenResponse.ok()).toBeFalsy()
		const errorData = await tokenResponse.json()
		expect(errorData.error).toBe('invalid_grant')
	})

	test.afterEach(async ({ page }) => {
		await deleteAccount(page)
	})
})
