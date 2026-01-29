/**
 * Load Test
 *
 * Simulates normal production traffic patterns.
 * Use this to verify the system handles expected load.
 *
 * Stages:
 * 1. Ramp up to 25 users over 1 minute
 * 2. Stay at 25 users for 2 minutes
 * 3. Ramp up to 50 users over 1 minute
 * 4. Stay at 50 users for 2 minutes
 * 5. Ramp down over 1 minute
 *
 * Usage:
 *   k6 run dist/load.js
 *   BASE_URL=https://timelines.tenebrie.com k6 run dist/load.js
 */

import { group, sleep } from 'k6'
import { Counter, Trend } from 'k6/metrics/index'
import { Options } from 'k6/options/index'

import { BASE_URL, DEFAULT_THRESHOLDS } from './config.ts'
import {
	checkAuth,
	createTestUser,
	createWorld,
	createWorldEvent,
	deleteTestUser,
	deleteWorld,
	getWorldDetails,
	getWorlds,
	World,
} from './helpers.ts'

// Custom metrics
const worldsCreated = new Counter('worlds_created')
const eventsCreated = new Counter('events_created')
const apiLatency = new Trend('api_latency')

export const options: Options = {
	stages: [
		{ duration: '1m', target: 25 }, // Ramp up to 25 users
		{ duration: '2m', target: 25 }, // Stay at 25
		{ duration: '1m', target: 50 }, // Ramp up to 50
		{ duration: '2m', target: 50 }, // Stay at 50
		{ duration: '1m', target: 0 }, // Ramp down
	],
	thresholds: {
		...DEFAULT_THRESHOLDS,
		api_latency: ['p(95)<400'],
	},
}

export function setup(): void {
	console.log(`Running load test against: ${BASE_URL}`)
	console.log('This test will run for approximately 7 minutes')
}

export default function (): void {
	// Each VU creates their own user to simulate real usage
	const user = createTestUser()
	if (!user) {
		console.error('Failed to create user, skipping iteration')
		sleep(1)
		return
	}

	let world: World | null = null

	try {
		group('Authentication Flow', function () {
			// Check auth status
			const start = Date.now()
			checkAuth(user.cookies)
			apiLatency.add(Date.now() - start)
			sleep(0.5)
		})

		group('World Management', function () {
			// Get existing worlds
			const start1 = Date.now()
			getWorlds(user.cookies)
			apiLatency.add(Date.now() - start1)
			sleep(0.5)

			// Create a new world
			const start2 = Date.now()
			world = createWorld(user.cookies)
			if (world) {
				worldsCreated.add(1)
				apiLatency.add(Date.now() - start2)
			}
			sleep(0.5)

			// Get world details
			if (world) {
				const start3 = Date.now()
				getWorldDetails(user.cookies, world.id)
				apiLatency.add(Date.now() - start3)
			}
			sleep(0.5)
		})

		group('Event Operations', function () {
			if (world) {
				// Create a few events
				for (let i = 0; i < 3; i++) {
					const start = Date.now()
					const event = createWorldEvent(user.cookies, world.id)
					if (event) {
						eventsCreated.add(1)
						apiLatency.add(Date.now() - start)
					}
					sleep(0.3)
				}

				// Fetch world details again (includes events)
				const start = Date.now()
				getWorldDetails(user.cookies, world.id)
				apiLatency.add(Date.now() - start)
			}
			sleep(0.5)
		})

		group('Read Operations', function () {
			// Simulate browsing - multiple read operations
			for (let i = 0; i < 2; i++) {
				const start = Date.now()
				getWorlds(user.cookies)
				apiLatency.add(Date.now() - start)
				sleep(0.5)
			}
		})
	} finally {
		// Cleanup - delete world and user
		// Note: world is assigned inside callbacks, TypeScript can't track this
		const worldToDelete = world as World | null
		if (worldToDelete) {
			deleteWorld(user.cookies, worldToDelete.id)
		}
		deleteTestUser(user.cookies)
	}
}

export function teardown(): void {
	console.log('Load test complete')
	console.log('Check the summary above for detailed metrics')
}
