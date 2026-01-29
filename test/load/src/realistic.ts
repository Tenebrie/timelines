/**
 * Realistic User Session Test
 *
 * Simulates actual user behavior with realistic think times.
 * Each VU represents one real user doing normal activities:
 * - Browse worlds
 * - View world details
 * - Create/edit events occasionally
 * - Natural reading pauses between actions
 *
 * Users are created once per VU and reused throughout the test.
 * This gives a more accurate "concurrent users" capacity number.
 *
 * Usage:
 *   yarn docker:realistic
 */

import { sleep } from 'k6'
import { Counter } from 'k6/metrics/index'
import { Options } from 'k6/options/index'

import { BASE_URL, DEFAULT_THRESHOLDS } from './config.ts'
import {
	createTestUser,
	createWorld,
	createWorldEvent,
	getWorldDetails,
	getWorlds,
	TestUser,
	World,
} from './helpers.ts'

const sessionsCompleted = new Counter('sessions_completed')
const actionsPerformed = new Counter('actions_performed')

export const options: Options = {
	scenarios: {
		realistic_users: {
			executor: 'ramping-vus',
			startVUs: 0,
			stages: [
				{ duration: '30s', target: 50 }, // Ramp up to 20 users
				{ duration: '2m', target: 50 }, // Hold at 20
				{ duration: '30s', target: 100 }, // Ramp to 100
				{ duration: '2m', target: 100 }, // Hold at 100
				{ duration: '30s', target: 0 }, // Ramp down
			],
		},
	},
	thresholds: {
		...DEFAULT_THRESHOLDS,
		http_req_failed: ['rate<0.05'], // Allow 5% errors for realistic test
	},
}

// Per-VU state (each VU gets their own instance)
let user: TestUser | null = null
let userWorld: World | null = null

export function setup(): void {
	console.log(`🧑 Realistic user session test against: ${BASE_URL}`)
	console.log('Each VU simulates one real user with natural behavior')
	console.log('Duration: approximately 8.5 minutes')
}

/**
 * Random think time to simulate user reading/thinking
 */
function thinkTime(min: number, max: number): void {
	const duration = min + Math.random() * (max - min)
	sleep(duration)
}

/**
 * Simulate a user browsing and occasionally taking actions
 */
export default function (): void {
	// Create user once per VU (on first iteration)
	if (!user) {
		user = createTestUser()
		if (!user) {
			console.error('Failed to create user for VU')
			sleep(5)
			return
		}
		// Create a world for this user to work with
		userWorld = createWorld(user.cookies)
		thinkTime(1, 2) // Brief pause after setup
	}

	// Simulate a realistic user session
	// Users mostly read, occasionally write

	// 1. Check their worlds (like opening the app)
	getWorlds(user.cookies)
	actionsPerformed.add(1)
	thinkTime(2, 5) // User looks at their world list

	// 2. Open a world (80% of the time)
	if (userWorld && Math.random() < 0.8) {
		getWorldDetails(user.cookies, userWorld.id)
		actionsPerformed.add(1)
		thinkTime(3, 8) // User reads the timeline

		// 3. Maybe create an event (20% chance while viewing)
		if (Math.random() < 0.2) {
			createWorldEvent(user.cookies, userWorld.id)
			actionsPerformed.add(1)
			thinkTime(2, 4) // User reviews what they created
		}

		// 4. Maybe view the world again (checking their changes)
		if (Math.random() < 0.5) {
			getWorldDetails(user.cookies, userWorld.id)
			actionsPerformed.add(1)
			thinkTime(2, 5)
		}
	}

	// 5. Sometimes check the worlds list again before "leaving"
	if (Math.random() < 0.3) {
		getWorlds(user.cookies)
		actionsPerformed.add(1)
		thinkTime(1, 3)
	}

	// 6. User takes a longer break (simulating tabbed out, reading, etc.)
	thinkTime(5, 15)

	sessionsCompleted.add(1)
}

/**
 * Cleanup - runs once at the end
 * Note: Won't run if test is interrupted (Ctrl+C)
 */
export function teardown(): void {
	console.log('Cleaning up test users...')
	console.log('Note: If test was interrupted, orphaned users may remain.')
	console.log('Consider a backend cleanup job for loadtest-* users.')
}
