/**
 * Stress Test
 *
 * Pushes the system beyond normal capacity to find breaking points.
 * Use this to discover the system's limits and how it degrades under extreme load.
 *
 * WARNING: This test generates significant load. Use with caution on production!
 *
 * Stages:
 * 1. Ramp up to 50 users (normal load)
 * 2. Ramp up to 100 users (above normal)
 * 3. Ramp up to 150 users (high load)
 * 4. Spike to 200 users (stress)
 * 5. Recovery period
 *
 * Usage:
 *   k6 run dist/stress.js
 */

import { sleep } from 'k6'
import http from 'k6/http/index'
import { Counter, Rate } from 'k6/metrics/index'
import { Options } from 'k6/options/index'

import { BASE_URL, STRESS_THRESHOLDS } from './config.ts'
import {
	createTestUser,
	createWorld,
	createWorldEvent,
	deleteTestUser,
	deleteWorld,
	getJarWithCookies,
} from './helpers.ts'

// Track errors at different load levels
const errorRate = new Rate('error_rate')
const timeouts = new Counter('timeouts')

export const options: Options = {
	stages: [
		{ duration: '30s', target: 50 }, // Normal load
		{ duration: '1m', target: 50 }, // Stay at normal
		{ duration: '30s', target: 100 }, // Above normal
		{ duration: '1m', target: 100 }, // Stay above normal
		{ duration: '30s', target: 150 }, // High load
		{ duration: '1m', target: 150 }, // Stay high
		{ duration: '30s', target: 200 }, // Stress!
		{ duration: '1m', target: 200 }, // Stay at stress
		{ duration: '1m', target: 50 }, // Recovery
		{ duration: '30s', target: 0 }, // Ramp down
	],
	thresholds: STRESS_THRESHOLDS,
}

export function setup(): void {
	console.debug(`⚠️  STRESS TEST - Running against: ${BASE_URL}`)
	console.debug('This test will generate significant load!')
	console.debug('Duration: approximately 8 minutes')
}

export default function (): void {
	const user = createTestUser()
	if (!user) {
		errorRate.add(1)
		sleep(1)
		return
	}

	const jar = getJarWithCookies(user.cookies)
	let world = null
	let hasError = false

	try {
		// Quick auth check
		const authRes = http.get(`${BASE_URL}/api/auth`, {
			jar,
			timeout: '10s',
		})

		if (authRes.status !== 200) {
			hasError = true
		}
		if (authRes.timings.duration > 5000) {
			timeouts.add(1)
		}
		sleep(0.3)

		// Create world
		world = createWorld(user.cookies)
		if (!world) {
			hasError = true
		}
		sleep(0.3)

		// Create event (if world exists)
		if (world) {
			const event = createWorldEvent(user.cookies, world.id)
			if (!event) {
				hasError = true
			}
		}
		sleep(0.3)

		// Fetch worlds
		const worldsRes = http.get(`${BASE_URL}/api/worlds`, {
			jar,
			timeout: '10s',
		})
		if (worldsRes.status !== 200) {
			hasError = true
		}
		sleep(0.3)

		errorRate.add(hasError ? 1 : 0)
	} finally {
		// Always cleanup
		if (world) {
			deleteWorld(user.cookies, world.id)
		}
		deleteTestUser(user.cookies)
	}
}

export function teardown(): void {
	console.debug('Stress test complete')
	console.debug('Review the error_rate and timeouts metrics to identify breaking points')
}
