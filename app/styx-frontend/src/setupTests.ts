import '@testing-library/jest-dom'

import nodeFetch, { Request, Response } from 'node-fetch'

vi.mock('./app/features/liveUpdates/useLiveUpdates', () => ({
	useLiveUpdates: () => {
		/* Empty */
	},
}))

Object.assign(globalThis, { fetch: nodeFetch, Request, Response })
