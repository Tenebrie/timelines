import type { paths } from '../rhea-api.js'

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
