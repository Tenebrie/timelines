import { check } from 'k6'
import http, { CookieJar, RefinedResponse, ResponseType } from 'k6/http/index'

import { API_HEADERS, BASE_URL, generateTestEmail, generateTestUsername } from './config.ts'

export interface TestUser {
	email: string
	username: string
	password: string
	cookies: Record<string, string>
}

export interface World {
	id: string
	name: string
}

export interface WorldEvent {
	id: string
	name: string
}

/**
 * Get a cookie jar with the user's cookies set
 */
export function getJarWithCookies(cookies: Record<string, string>): CookieJar {
	const jar = http.cookieJar()
	for (const [name, value] of Object.entries(cookies)) {
		jar.set(BASE_URL, name, value)
	}
	return jar
}

/**
 * Create a new test user account and return the auth cookie
 */
export function createTestUser(): TestUser | null {
	const email = generateTestEmail()
	const username = generateTestUsername()
	const password = 'LoadTestPassword123!'

	const payload = JSON.stringify({
		email,
		username,
		password,
	})

	const response = http.post(`${BASE_URL}/api/auth`, payload, {
		headers: API_HEADERS,
	})

	const success = check(response, {
		'user created successfully': (r) => r.status === 200,
	})

	if (!success) {
		console.error(`Failed to create user: ${response.status} ${response.body}`)
		return null
	}

	// Extract cookie values (not the jar object)
	const cookieValues: Record<string, string> = {}
	for (const [name, values] of Object.entries(response.cookies)) {
		if (values.length > 0) {
			cookieValues[name] = values[0].value
		}
	}

	return {
		email,
		username,
		password,
		cookies: cookieValues,
	}
}

/**
 * Login with existing credentials
 */
export function login(email: string, password: string): Record<string, string> {
	const payload = JSON.stringify({ email, password })

	const response = http.post(`${BASE_URL}/api/auth/login`, payload, {
		headers: API_HEADERS,
	})

	check(response, {
		'login successful': (r) => r.status === 200,
	})

	const cookieValues: Record<string, string> = {}
	for (const [name, values] of Object.entries(response.cookies)) {
		if (values.length > 0) {
			cookieValues[name] = values[0].value
		}
	}

	return cookieValues
}

/**
 * Delete the current user account
 */
export function deleteTestUser(cookies: Record<string, string>): void {
	const jar = getJarWithCookies(cookies)
	const response = http.del(`${BASE_URL}/api/auth`, null, {
		jar,
	})

	check(response, {
		'user deleted successfully': (r) => r.status === 200 || r.status === 204,
	})
}

/**
 * Create a new world
 */
export function createWorld(cookies: Record<string, string>): World | null {
	const jar = getJarWithCookies(cookies)
	const worldName = `LoadTest World ${Date.now()}`

	const payload = JSON.stringify({
		name: worldName,
		description: 'Created by k6 load test',
	})

	const response = http.post(`${BASE_URL}/api/worlds`, payload, {
		headers: API_HEADERS,
		jar,
	})

	const success = check(response, {
		'world created successfully': (r) => r.status === 200,
	})

	if (!success) {
		console.error(`Failed to create world: ${response.status} ${response.body}`)
		return null
	}

	const body = JSON.parse(response.body as string) as { id: string }
	return {
		id: body.id,
		name: worldName,
	}
}

/**
 * Create a world event
 */
export function createWorldEvent(cookies: Record<string, string>, worldId: string): WorldEvent | null {
	const jar = getJarWithCookies(cookies)
	const timestamp = Date.now() * 1000 // BigInt simulation

	const payload = JSON.stringify({
		name: `Load Test Event ${Date.now()}`,
		descriptionRich:
			'{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Test event description"}]}]}',
		timestamp: timestamp.toString(),
	})

	const response = http.post(`${BASE_URL}/api/world/${worldId}/event`, payload, {
		headers: API_HEADERS,
		jar,
	})

	check(response, {
		'event created successfully': (r) => r.status === 200,
	})

	if (response.status === 200) {
		return JSON.parse(response.body as string) as WorldEvent
	}
	return null
}

/**
 * Get world details
 */
export function getWorldDetails(
	cookies: Record<string, string>,
	worldId: string,
): RefinedResponse<ResponseType> {
	const jar = getJarWithCookies(cookies)
	const response = http.get(`${BASE_URL}/api/world/${worldId}`, {
		jar,
	})

	check(response, {
		'world details retrieved': (r) => r.status === 200,
	})

	return response
}

/**
 * Get list of user's worlds
 */
export function getWorlds(cookies: Record<string, string>): RefinedResponse<ResponseType> {
	const jar = getJarWithCookies(cookies)
	const response = http.get(`${BASE_URL}/api/worlds`, {
		jar,
	})

	check(response, {
		'worlds list retrieved': (r) => r.status === 200,
	})

	return response
}

/**
 * Check authentication status
 */
export function checkAuth(cookies: Record<string, string>): RefinedResponse<ResponseType> {
	const jar = getJarWithCookies(cookies)
	const response = http.get(`${BASE_URL}/api/auth`, {
		jar,
	})

	check(response, {
		'auth check successful': (r) => r.status === 200,
	})

	return response
}

/**
 * Delete a world
 */
export function deleteWorld(cookies: Record<string, string>, worldId: string): void {
	const jar = getJarWithCookies(cookies)
	const response = http.del(`${BASE_URL}/api/world/${worldId}`, null, {
		jar,
	})

	check(response, {
		'world deleted': (r) => r.status === 200 || r.status === 204,
	})
}
