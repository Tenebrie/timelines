import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['imageGeneration'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getImageGenerationModels: build.query<
				GetImageGenerationModelsApiResponse,
				GetImageGenerationModelsApiArg
			>({
				query: () => ({ url: `/api/images/generate/models` }),
				providesTags: ['imageGeneration'],
			}),
			requestImageGeneration: build.mutation<RequestImageGenerationApiResponse, RequestImageGenerationApiArg>(
				{
					query: (queryArg) => ({ url: `/api/images/generate`, method: 'POST', body: queryArg.body }),
					invalidatesTags: ['imageGeneration'],
				},
			),
			getImageGenerationHistory: build.query<
				GetImageGenerationHistoryApiResponse,
				GetImageGenerationHistoryApiArg
			>({
				query: (queryArg) => ({
					url: `/api/images/generate/history`,
					params: {
						page: queryArg.page,
						size: queryArg.size,
					},
				}),
				providesTags: ['imageGeneration'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as imageGenerationApi }
export type GetImageGenerationModelsApiResponse = /** status 200  */ {
	models: {
		id: string
		name: string
	}[]
}
export type GetImageGenerationModelsApiArg = void
export type RequestImageGenerationApiResponse = /** status 200  */ {
	assets: {
		id: string
		status: 'Pending' | 'Finalized' | 'Failed'
		createdAt: string
	}[]
}
export type RequestImageGenerationApiArg = {
	body: {
		prompt: string
		model: string
		numberOfImages?: number
		referenceImages?: {
			base64: string
			mimeType: string
		}[]
	}
}
export type GetImageGenerationHistoryApiResponse = /** status 200  */ {
	assets: {
		id: string
		status: 'Pending' | 'Finalized' | 'Failed'
		createdAt: string
		originalFileName: string
		originalFileExtension: string
		contentDescription?: null | string
		imageWidth?: null | number
		imageHeight?: null | number
	}[]
	page: number
	size: number
	pageCount: number
}
export type GetImageGenerationHistoryApiArg = {
	/** Any numeric value */
	page?: number
	/** Any numeric value */
	size?: number
}
export const {
	useGetImageGenerationModelsQuery,
	useLazyGetImageGenerationModelsQuery,
	useRequestImageGenerationMutation,
	useGetImageGenerationHistoryQuery,
	useLazyGetImageGenerationHistoryQuery,
} = injectedRtkApi
