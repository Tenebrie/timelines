import { baseApi as api } from './base/baseApi'
export const addTagTypes = [] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			adminGetUserLevels: build.query<AdminGetUserLevelsApiResponse, AdminGetUserLevelsApiArg>({
				query: () => ({ url: `/api/constants/admin-levels` }),
			}),
			listWorldAccessModes: build.query<ListWorldAccessModesApiResponse, ListWorldAccessModesApiArg>({
				query: () => ({ url: `/api/constants/world-access-modes` }),
			}),
			getHealth: build.query<GetHealthApiResponse, GetHealthApiArg>({
				query: () => ({ url: `/health` }),
			}),
			getSupportedImageFormats: build.query<
				GetSupportedImageFormatsApiResponse,
				GetSupportedImageFormatsApiArg
			>({
				query: () => ({ url: `/api/images/formats` }),
			}),
			requestImageConversion: build.mutation<RequestImageConversionApiResponse, RequestImageConversionApiArg>(
				{
					query: (queryArg) => ({ url: `/api/images/convert`, method: 'POST', body: queryArg.body }),
				},
			),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as otherApi }
export type AdminGetUserLevelsApiResponse = /** status 200  */ ('Free' | 'Premium' | 'Admin')[]
export type AdminGetUserLevelsApiArg = void
export type ListWorldAccessModesApiResponse = /** status 200  */ ('Private' | 'PublicRead' | 'PublicEdit')[]
export type ListWorldAccessModesApiArg = void
export type GetHealthApiResponse = unknown
export type GetHealthApiArg = void
export type GetSupportedImageFormatsApiResponse = /** status 200  */ {
	formats: ('webp' | 'jpeg' | 'png' | 'gif')[]
}
export type GetSupportedImageFormatsApiArg = void
export type RequestImageConversionApiResponse = /** status 200  */ {
	status: 'Pending' | 'Finalized' | 'Failed'
	id: string
	createdAt: string
	updatedAt: string
	ownerId: string
	size: number
	expiresAt?: null | string
	bucketKey: string
	originalFileName: string
	originalFileExtension: string
	contentType: 'ImageConversion' | 'Avatar'
}
export type RequestImageConversionApiArg = {
	body: {
		assetId: string
		format: 'webp' | 'jpeg' | 'png' | 'gif'
		width?: number
		height?: number
		quality?: number
	}
}
export const {
	useAdminGetUserLevelsQuery,
	useLazyAdminGetUserLevelsQuery,
	useListWorldAccessModesQuery,
	useLazyListWorldAccessModesQuery,
	useGetHealthQuery,
	useLazyGetHealthQuery,
	useGetSupportedImageFormatsQuery,
	useLazyGetSupportedImageFormatsQuery,
	useRequestImageConversionMutation,
} = injectedRtkApi
