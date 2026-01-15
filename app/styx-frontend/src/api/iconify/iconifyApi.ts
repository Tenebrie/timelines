import { IconifyInfo } from '@iconify/types'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { isRunningInTest } from '@/test-utils/isRunningInTest'

export const addTagTypes = ['actorList', 'worldDetails'] as const

export const iconifyApi = createApi({
	reducerPath: 'iconifyApi',
	baseQuery: fetchBaseQuery({
		baseUrl: isRunningInTest() ? 'http://fakeiconify/' : 'https://api.iconify.design/',
	}),
	endpoints: (build) => ({
		getIconifyIcons: build.query<GetIconifyIconsResponse, GetIconifyIconsArg>({
			query: (arg) => `/search?query=${arg.query}`,
		}),
		getIconifyCollections: build.query<GetIconifyCollectionsResponse, void>({
			query: () => `/collections`,
		}),
	}),
})

// const injectedRtkApi = api
// 	.enhanceEndpoints({
// 		addTagTypes,
// 	})
// 	.injectEndpoints({
// 		endpoints: (build) => ({
// 			createActor: build.mutation<CreateActorApiResponse, CreateActorApiArg>({
// 				query: (queryArg) => ({
// 					url: `/api/world/${queryArg.worldId}/actors`,
// 					method: 'POST',
// 					body: queryArg.body,
// 				}),
// 				invalidatesTags: ['actorList', 'worldDetails'],
// 			}),
// 			updateActor: build.mutation<UpdateActorApiResponse, UpdateActorApiArg>({
// 				query: (queryArg) => ({
// 					url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}`,
// 					method: 'PATCH',
// 					body: queryArg.body,
// 				}),
// 				invalidatesTags: ['actorList'],
// 			}),
// 			deleteActor: build.mutation<DeleteActorApiResponse, DeleteActorApiArg>({
// 				query: (queryArg) => ({
// 					url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}`,
// 					method: 'DELETE',
// 				}),
// 				invalidatesTags: ['actorList', 'worldDetails'],
// 			}),
// 		}),
// 		overrideExisting: false,
// 	})

export type GetIconifyIconsResponse = {
	icons: string[]
	limit: number
	start: number
	total: number
	request: Record<string, string>
	collections: Record<string, IconifyInfo>
}

export type GetIconifyIconsArg = {
	query: string
}

export type GetIconifyCollectionsResponse = Record<string, IconifyInfo>

export const {
	useGetIconifyIconsQuery,
	useLazyGetIconifyIconsQuery,
	useGetIconifyCollectionsQuery,
	useLazyGetIconifyCollectionsQuery,
} = iconifyApi
export const IconifyApiReducer = iconifyApi.reducer
