import type { paths } from '@neverkin/openapi-fetch'

export type GetResponse<T extends keyof paths> = paths[T] extends {
	get: {
		responses: {
			200: {
				content: {
					'application/json': infer R
				}
			}
		}
	}
}
	? R
	: never
