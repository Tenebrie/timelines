import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldThumbnail'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getWorldThumbnail: build.query<GetWorldThumbnailApiResponse, GetWorldThumbnailApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/thumbnail` }),
				providesTags: ['worldThumbnail'],
			}),
			getWorldThumbnailMetadata: build.query<
				GetWorldThumbnailMetadataApiResponse,
				GetWorldThumbnailMetadataApiArg
			>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/thumbnail/metadata` }),
				providesTags: ['worldThumbnail'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as worldThumbnailApi }
export type GetWorldThumbnailApiResponse = unknown
export type GetWorldThumbnailApiArg = {
	/** Any string value */
	worldId: string
}
export type GetWorldThumbnailMetadataApiResponse = /** status 200  */ {
	color: {
		rgb: string
		rgba: string
		hex: string
		hexa: string
		value: number[]
		isDark: boolean
		isLight: boolean
	}
}
export type GetWorldThumbnailMetadataApiArg = {
	/** Any string value */
	worldId: string
}
export const {
	useGetWorldThumbnailQuery,
	useLazyGetWorldThumbnailQuery,
	useGetWorldThumbnailMetadataQuery,
	useLazyGetWorldThumbnailMetadataQuery,
} = injectedRtkApi
