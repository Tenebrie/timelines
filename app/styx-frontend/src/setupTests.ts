import '@testing-library/jest-dom'

import nodeFetch, { Request, Response } from 'node-fetch'

vi.mock('./app/features/liveUpdates/useLiveUpdates', () => ({
	useLiveUpdates: () => {
		/* Empty */
	},
}))

Object.assign(global, { fetch: nodeFetch, Request, Response })
