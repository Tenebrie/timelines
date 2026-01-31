/**
 * Soak Test (Endurance Test)
 *
 * Tests system stability over an extended period of time.
 * Useful for detecting:
 * - Memory leaks
 * - Database connection pool exhaustion
 * - Gradual performance degradation
 * - Resource leaks
 *
 * Usage:
 *   k6 run dist/soak.js
 *
 * Note: This test runs for 30+ minutes. For production soak tests,
 * consider running for several hours.
 */

import { group, sleep } from 'k6'
import { Counter, Trend } from 'k6/metrics/index'
import { Options } from 'k6/options/index'

import { BASE_URL, DEFAULT_THRESHOLDS } from './config.ts'
import {
	createTestUser,
	createWorld,
	createWorldEvent,
	deleteTestUser,
	deleteWorld,
	getWorldDetails,
	getWorlds,
	World,
} from './helpers.ts'

// Track performance over time
const iterationDuration = new Trend('iteration_duration')
const successfulIterations = new Counter('successful_iterations')
const failedIterations = new Counter('failed_iterations')

export const options: Options = {
	stages: [
		{ duration: '2m', target: 30 }, // Ramp up
		{ duration: '26m', target: 30 }, // Stay at moderate load for extended period
		{ duration: '2m', target: 0 }, // Ramp down
	],
	thresholds: {
		...DEFAULT_THRESHOLDS,
		iteration_duration: ['p(95)<30000'], // Full iteration should complete in 30s
	},
}

interface SetupData {
	startTime: number
}

export function setup(): SetupData {
	console.debug(`Running SOAK TEST against: ${BASE_URL}`)
	console.debug('⏱️  This test runs for approximately 30 minutes')
	console.debug('Monitoring for memory leaks and performance degradation...')
	return {
		startTime: Date.now(),
	}
}

export default function (_data: SetupData): void {
	const iterationStart = Date.now()
	let success = true

	const user = createTestUser()
	if (!user) {
		failedIterations.add(1)
		sleep(2)
		return
	}

	let world: World | null = null

	try {
		// Simulate typical user session
		group('User Session', function () {
			// Get worlds
			const worldsRes = getWorlds(user.cookies)
			if (worldsRes.status !== 200) success = false
			sleep(1)

			// Create a world
			world = createWorld(user.cookies)
			if (!world) success = false
			sleep(1)

			// Work with the world
			if (world) {
				// Get world details
				getWorldDetails(user.cookies, world.id)
				sleep(0.5)

				// Create some events
				for (let i = 0; i < 2; i++) {
					createWorldEvent(user.cookies, world.id)
					sleep(0.5)
				}

				// Fetch updated world
				getWorldDetails(user.cookies, world.id)
				sleep(0.5)
			}

			// Browse around
			getWorlds(user.cookies)
			sleep(1)
		})

		if (success) {
			successfulIterations.add(1)
		} else {
			failedIterations.add(1)
		}
	} finally {
		// Cleanup
		// Note: world is assigned inside callbacks, TypeScript can't track this
		const worldToDelete = world as World | null
		if (worldToDelete) {
			deleteWorld(user.cookies, worldToDelete.id)
		}
		deleteTestUser(user.cookies)

		// Record iteration duration
		iterationDuration.add(Date.now() - iterationStart)
	}

	// Pause between iterations
	sleep(2)
}

export function teardown(data: SetupData): void {
	const duration = ((Date.now() - data.startTime) / 1000 / 60).toFixed(1)
	console.debug(`\nSoak test complete after ${duration} minutes`)
	console.debug('Review iteration_duration trend over time to detect degradation')
	console.debug('Check successful_iterations vs failed_iterations ratio')
}
