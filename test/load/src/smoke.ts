/**
 * Smoke Test
 *
 * Quick validation that the system works under minimal load.
 * Run this first to ensure everything is working before running heavier load tests.
 *
 * Usage:
 *   k6 run dist/smoke.js
 *   BASE_URL=http://localhost:5173 k6 run dist/smoke.js
 */

import { check, sleep } from 'k6'
import http from 'k6/http/index'
import { Options } from 'k6/options/index'

import { BASE_URL, SMOKE_THRESHOLDS } from './config.ts'
import {
	checkAuth,
	createTestUser,
	createWorld,
	deleteTestUser,
	deleteWorld,
	getJarWithCookies,
	getWorlds,
	TestUser,
	World,
} from './helpers.ts'

export const options: Options = {
	vus: 1,
	duration: '30s',
	thresholds: SMOKE_THRESHOLDS,
}

interface SetupData {
	user: TestUser
	world: World | null
}

export function setup(): SetupData {
	console.debug(`Running smoke test against: ${BASE_URL}`)

	// Create a test user for authenticated endpoints
	const user = createTestUser()
	if (!user) {
		throw new Error('Failed to create test user during setup')
	}

	// Create a test world
	const world = createWorld(user.cookies)

	return {
		user,
		world,
	}
}

export default function (data: SetupData): void {
	const { user, world } = data

	// Test 1: Health check / public endpoint
	const healthRes = http.get(`${BASE_URL}/health`)
	check(healthRes, {
		'health check returns 200': (r) => r.status === 200,
	})
	sleep(0.5)

	// Test 2: Auth check
	checkAuth(user.cookies)
	sleep(0.5)

	// Test 3: Get worlds list
	getWorlds(user.cookies)
	sleep(0.5)

	// Test 4: Get world details (if world was created)
	if (world) {
		const jar = getJarWithCookies(user.cookies)
		const worldRes = http.get(`${BASE_URL}/api/world/${world.id}`, {
			jar,
		})
		check(worldRes, {
			'world details retrieved': (r) => r.status === 200,
		})
	}
	sleep(0.5)
}

export function teardown(data: SetupData): void {
	const { user, world } = data

	// Clean up: delete test world and user
	if (world) {
		deleteWorld(user.cookies, world.id)
	}
	if (user) {
		deleteTestUser(user.cookies)
	}

	console.debug('Smoke test cleanup complete')
}
