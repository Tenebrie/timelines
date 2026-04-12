import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldColor'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getWorldColors: build.query<GetWorldColorsApiResponse, GetWorldColorsApiArg>({
				query: (queryArg) => ({ url: `/api/worlds/${queryArg.worldId}/colors` }),
				providesTags: ['worldColor'],
			}),
			createWorldColor: build.mutation<CreateWorldColorApiResponse, CreateWorldColorApiArg>({
				query: (queryArg) => ({
					url: `/api/worlds/${queryArg.worldId}/colors`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldColor'],
			}),
			deleteWorldColor: build.mutation<DeleteWorldColorApiResponse, DeleteWorldColorApiArg>({
				query: (queryArg) => ({
					url: `/api/worlds/${queryArg.worldId}/colors/${queryArg.colorId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldColor'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as worldColorApi }
export type GetWorldColorsApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	worldId: string
	value: string
	label?: null | string
}[]
export type GetWorldColorsApiArg = {
	/** Any string value with at least one character */
	worldId: string
}
export type CreateWorldColorApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	worldId: string
	value: string
	label?: null | string
}
export type CreateWorldColorApiArg = {
	/** Any string value with at least one character */
	worldId: string
	body: {
		value: string
		label?: string
	}
}
export type DeleteWorldColorApiResponse = unknown
export type DeleteWorldColorApiArg = {
	/** Any string value with at least one character */
	worldId: string
	/** Any string value with at least one character */
	colorId: string
}
export const {
	useGetWorldColorsQuery,
	useLazyGetWorldColorsQuery,
	useCreateWorldColorMutation,
	useDeleteWorldColorMutation,
} = injectedRtkApi
