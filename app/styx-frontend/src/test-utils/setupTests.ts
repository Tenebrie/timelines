import '@testing-library/jest-dom'

import { configure } from '@testing-library/dom'
import nodeFetch, { Request, Response } from 'node-fetch'

console.debug = () => {}

vi.mock('./app/features/liveUpdates/useLiveUpdates', () => ({
	useLiveUpdates: () => {
		/* Empty */
	},
}))

configure({
	getElementError: (message) => {
		const error = new Error(message ?? '')
		error.name = 'TestingLibraryElementError'
		error.stack = undefined
		return error
	},
})

Object.assign(globalThis, { fetch: nodeFetch, Request, Response })

beforeAll(() => {
	global.ResizeObserver = class ResizeObserver {
		observe() {
			// do nothing
		}
		unobserve() {
			// do nothing
		}
		disconnect() {
			// do nothing
		}
	}
	global.requestIdleCallback = (callback: IdleRequestCallback, options?: IdleRequestOptions) => {
		const start = Date.now()
		return setTimeout(() => {
			callback({
				didTimeout: false,
				timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
			})
		}, 1) as unknown as number
	}
	global.requestAnimationFrame = (callback: FrameRequestCallback) => {
		return setTimeout(callback, 1) as unknown as number
	}
})
window.scrollTo = vi.fn()
