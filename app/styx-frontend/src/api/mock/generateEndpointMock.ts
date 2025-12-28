import { type DefaultBodyType, rest } from 'msw'
import type { SetupServer } from 'msw/node'

type HttpMethod = keyof typeof rest

export type MockParams<ResponseT extends DefaultBodyType> =
	| {
			response: ResponseT
	  }
	| {
			error: { status: number; message: string }
	  }

export const generateEndpointMock = (
	server: SetupServer,
	{ method, path, ...params }: { method: HttpMethod; path: string } & MockParams<DefaultBodyType>,
) => {
	let invocations: { jsonBody: unknown }[] = []

	const handler = rest[method](path, async (req, res, ctx) => {
		invocations.push({
			jsonBody: req.method === 'POST' || req.method === 'PATCH' ? await req.json() : {},
		})

		const status = (() => {
			if ('error' in params) {
				return params.error.status
			} else if ('response' in params) {
				return 200
			}
			return 204
		})()

		const returnedResponse = (() => {
			if ('error' in params) {
				return params.error
			} else if ('response' in params) {
				return params.response
			}
			return undefined
		})()

		return res(ctx.status(status), ctx.json(returnedResponse))
	})
	server.use(handler)

	return {
		invocations,
		hasBeenCalled: () => invocations.length > 0,
		clearInvocations: () => (invocations = []),
	}
}
