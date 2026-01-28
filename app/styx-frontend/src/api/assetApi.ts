import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['asset'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getAsset: build.query<GetAssetApiResponse, GetAssetApiArg>({
				query: (queryArg) => ({ url: `/api/assets/${queryArg.assetId}` }),
				providesTags: ['asset'],
			}),
			deleteAsset: build.mutation<DeleteAssetApiResponse, DeleteAssetApiArg>({
				query: (queryArg) => ({ url: `/api/assets/${queryArg.assetId}`, method: 'DELETE' }),
				invalidatesTags: ['asset'],
			}),
			listUserAssets: build.query<ListUserAssetsApiResponse, ListUserAssetsApiArg>({
				query: () => ({ url: `/api/assets` }),
				providesTags: ['asset'],
			}),
			requestPresignedUrl: build.mutation<RequestPresignedUrlApiResponse, RequestPresignedUrlApiArg>({
				query: (queryArg) => ({ url: `/api/assets/upload/presigned`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['asset'],
			}),
			finalizeAssetUpload: build.mutation<FinalizeAssetUploadApiResponse, FinalizeAssetUploadApiArg>({
				query: (queryArg) => ({ url: `/api/assets/upload/finalize`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['asset'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as assetApi }
export type GetAssetApiResponse = /** status 200  */ {
	url: string
}
export type GetAssetApiArg = {
	/** Any string value */
	assetId: string
}
export type DeleteAssetApiResponse = unknown
export type DeleteAssetApiArg = {
	/** Any string value */
	assetId: string
}
export type ListUserAssetsApiResponse = /** status 200  */ {
	assets: {
		id: string
		createdAt: string
		updatedAt: string
		ownerId: string
		size: number
		expiresAt?: null | string
		bucketKey: string
		originalFileName: string
		originalFileExtension: string
		contentType: 'Image' | 'Avatar'
		status: 'Pending' | 'Finalized' | 'Failed'
	}[]
}
export type ListUserAssetsApiArg = void
export type RequestPresignedUrlApiResponse = /** status 200  */ {
	asset: {
		id: string
		createdAt: string
		updatedAt: string
		ownerId: string
		size: number
		expiresAt?: null | string
		bucketKey: string
		originalFileName: string
		originalFileExtension: string
		contentType: 'Image' | 'Avatar'
		status: 'Pending' | 'Finalized' | 'Failed'
	}
	url: string
	fields: {
		[key: string]: string
	}
}
export type RequestPresignedUrlApiArg = {
	body: {
		fileName: string
		fileSize: number
		assetType: 'Image' | 'Avatar'
	}
}
export type FinalizeAssetUploadApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	ownerId: string
	size: number
	expiresAt?: null | string
	bucketKey: string
	originalFileName: string
	originalFileExtension: string
	contentType: 'Image' | 'Avatar'
	status: 'Pending' | 'Finalized' | 'Failed'
}
export type FinalizeAssetUploadApiArg = {
	body: {
		assetId: string
	}
}
export const {
	useGetAssetQuery,
	useLazyGetAssetQuery,
	useDeleteAssetMutation,
	useListUserAssetsQuery,
	useLazyListUserAssetsQuery,
	useRequestPresignedUrlMutation,
	useFinalizeAssetUploadMutation,
} = injectedRtkApi
