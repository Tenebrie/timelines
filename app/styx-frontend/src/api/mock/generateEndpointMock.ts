import { http, HttpResponse, type JsonBodyType } from 'msw'
import type { SetupServer } from 'msw/node'

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head'

export type MockParams<ResponseT extends JsonBodyType> =
	| {
			response: ResponseT
	  }
	| {
			error: { status: number; message: string }
	  }

export const generateEndpointMock = <ResponseT extends JsonBodyType = JsonBodyType>(
	server: SetupServer,
	{ method, path, ...params }: { method: HttpMethod; path: string } & MockParams<ResponseT>,
) => {
	let invocations: { jsonBody: unknown }[] = []

	const handler = http[method]('http://fakelocalhost' + path, async ({ request }) => {
		invocations.push({
			jsonBody: request.method === 'POST' || request.method === 'PATCH' ? await request.json() : {},
		})

		const status = (() => {
			if ('error' in params) {
				return params.error.status
			} else if ('response' in params) {
				return 200
			}
			return 204
		})()

		if ('error' in params) {
			return HttpResponse.json(params.error, { status })
		} else if ('response' in params) {
			return HttpResponse.json(params.response, { status })
		}
		return new HttpResponse(null, { status })
	})
	server.use(handler)

	return {
		invocations,
		hasBeenCalled: () => invocations.length > 0,
		clearInvocations: () => (invocations = []),
	}
}
