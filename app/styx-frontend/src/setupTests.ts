import '@testing-library/jest-dom'

import { configure } from '@testing-library/dom'
import nodeFetch, { Request, Response } from 'node-fetch'

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
