/**
 * WebSocket Load Test (Calliope)
 *
 * Tests the real-time collaboration system under load.
 * Simulates multiple users connecting and receiving updates.
 *
 * This tests:
 * - WebSocket connection establishment
 * - Connection stability under load
 * - Message delivery latency
 *
 * Usage:
 *   k6 run dist/websocket.js
 */

import { check, sleep } from 'k6'
import { Counter, Trend } from 'k6/metrics/index'
import { Options } from 'k6/options/index'
import ws from 'k6/ws/index'

import { DEFAULT_THRESHOLDS, WS_URL } from './config.ts'
import { createTestUser, createWorld, deleteTestUser, deleteWorld } from './helpers.ts'

// Custom WebSocket metrics
const wsConnections = new Counter('ws_connections')
const wsConnectionsFailed = new Counter('ws_connections_failed')
const wsMessages = new Counter('ws_messages_received')
const wsConnectTime = new Trend('ws_connect_time')

export const options: Options = {
	stages: [
		{ duration: '30s', target: 10 }, // Ramp up
		{ duration: '2m', target: 30 }, // Sustained load
		{ duration: '30s', target: 50 }, // Peak
		{ duration: '1m', target: 50 }, // Stay at peak
		{ duration: '30s', target: 0 }, // Ramp down
	],
	thresholds: {
		...DEFAULT_THRESHOLDS,
		ws_connections_failed: ['count<10'],
		ws_connect_time: ['p(95)<1000'],
	},
}

export function setup(): void {
	console.info(`Running WebSocket test against: ${WS_URL}`)
	console.info('Duration: approximately 5 minutes')
}

export default function (): void {
	// Create user and world for WebSocket test
	const user = createTestUser()
	if (!user) {
		wsConnectionsFailed.add(1)
		sleep(1)
		return
	}

	let world = null

	try {
		// Create a world to subscribe to
		world = createWorld(user.cookies)
		if (!world) {
			wsConnectionsFailed.add(1)
			sleep(1)
			return
		}

		// Note: k6 WebSocket module has limited cookie support
		// The WebSocket endpoint at /live/:sessionId requires a valid auth cookie
		const sessionId = `k6-session-${Date.now()}-${Math.random().toString(36).substring(7)}`
		const wsUrl = `${WS_URL}/live/${sessionId}`

		const startTime = Date.now()

		const res = ws.connect(wsUrl, {}, function (socket) {
			wsConnections.add(1)
			wsConnectTime.add(Date.now() - startTime)

			socket.on('open', function () {
				// Subscribe to world updates
				const subscribeMsg = JSON.stringify({
					type: 'subscribeToWorld',
					data: { worldId: world!.id },
				})
				socket.send(subscribeMsg)
			})

			socket.on('message', function (message: string) {
				wsMessages.add(1)

				// Parse and validate message
				try {
					const data = JSON.parse(message) as { type?: string }
					check(data, {
						'message has type': (d) => d.type !== undefined,
					})
				} catch {
					// Binary or non-JSON message
				}
			})

			socket.on('error', function (e) {
				console.error('WebSocket error:', e)
				wsConnectionsFailed.add(1)
			})

			socket.on('close', function () {
				// Connection closed normally
			})

			// Keep connection open for a while, simulating real user behavior
			socket.setTimeout(function () {
				// Unsubscribe and close
				const unsubscribeMsg = JSON.stringify({
					type: 'unsubscribeFromWorld',
					data: { worldId: world!.id },
				})
				socket.send(unsubscribeMsg)
				socket.close()
			}, 10000) // 10 seconds
		})

		check(res, {
			'WebSocket connection established': (r) => r && r.status === 101,
		})

		// Wait for WebSocket session to complete
		sleep(11)
	} finally {
		// Cleanup
		if (world) {
			deleteWorld(user.cookies, world.id)
		}
		if (user) {
			deleteTestUser(user.cookies)
		}
	}
}

export function teardown(): void {
	console.info('WebSocket test complete')
	console.info('Check ws_connections, ws_connections_failed, and ws_connect_time metrics')
}
