/**
 * Shared configuration for all k6 load tests
 */

// Base URL - defaults to production, can be overridden via environment variable
export const BASE_URL = __ENV.BASE_URL || 'https://timelines.tenebrie.com'

// WebSocket URL - derive from BASE_URL
export const WS_URL = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')

// Test user credentials (optional - for authenticated tests)
export const TEST_USER = {
	email: __ENV.TEST_USER_EMAIL || '',
	password: __ENV.TEST_USER_PASSWORD || '',
}

// Common thresholds
export const DEFAULT_THRESHOLDS = {
	// 95% of requests should complete within 500ms
	http_req_duration: ['p(95)<500'],
	// Less than 1% of requests should fail
	http_req_failed: ['rate<0.01'],
	// All checks should pass
	checks: ['rate>0.95'],
}

// Stricter thresholds for smoke tests
export const SMOKE_THRESHOLDS = {
	http_req_duration: ['p(95)<300'],
	http_req_failed: ['rate<0.001'],
	checks: ['rate>0.99'],
}

// More relaxed thresholds for stress tests
export const STRESS_THRESHOLDS = {
	http_req_duration: ['p(95)<2000'],
	http_req_failed: ['rate<0.05'],
	checks: ['rate>0.90'],
}

// Headers for API requests
export const API_HEADERS = {
	'Content-Type': 'application/json',
}

/**
 * Generate a unique test user email
 */
export function generateTestEmail(): string {
	const timestamp = Date.now()
	const random = Math.random().toString(36).substring(7)
	return `k6-loadtest-${timestamp}-${random}@localhost`
}

/**
 * Generate a unique username
 */
export function generateTestUsername(): string {
	const timestamp = Date.now()
	const random = Math.random().toString(36).substring(7)
	return `k6-${timestamp}-${random}`
}
