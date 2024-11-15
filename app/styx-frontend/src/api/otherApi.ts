import { baseApi as api } from './baseApi'
export const addTagTypes = [] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getHealth: build.query<GetHealthApiResponse, GetHealthApiArg>({
				query: () => ({ url: `/health` }),
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as otherApi }
export type GetHealthApiResponse = /** status 200  */ string
export type GetHealthApiArg = void
export const { useGetHealthQuery, useLazyGetHealthQuery } = injectedRtkApi
