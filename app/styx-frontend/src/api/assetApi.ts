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
export type ListUserAssetsApiResponse = /** status 200  */ {
	assets: {
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
	}[]
}
export type ListUserAssetsApiArg = void
export type RequestPresignedUrlApiResponse = /** status 200  */ {
	asset: {
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
	url: string
	fields: {
		[key: string]: string
	}
}
export type RequestPresignedUrlApiArg = {
	body: {
		fileName: string
		fileSize: number
		assetType: 'ImageConversion' | 'Avatar'
	}
}
export type FinalizeAssetUploadApiResponse = /** status 200  */ {
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
export type FinalizeAssetUploadApiArg = {
	body: {
		assetId: string
	}
}
export const {
	useGetAssetQuery,
	useLazyGetAssetQuery,
	useListUserAssetsQuery,
	useLazyListUserAssetsQuery,
	useRequestPresignedUrlMutation,
	useFinalizeAssetUploadMutation,
} = injectedRtkApi
