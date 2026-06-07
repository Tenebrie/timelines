import { baseApi as api } from './base/baseApi'
export const addTagTypes = [
	'worldBulk',
	'actorList',
	'worldEvent',
	'worldWikiFolder',
	'worldWikiArticle',
	'worldDetails',
] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			bulkDeleteEntities: build.mutation<BulkDeleteEntitiesApiResponse, BulkDeleteEntitiesApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/bulk/delete`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: [
					'worldBulk',
					'actorList',
					'worldEvent',
					'worldWikiFolder',
					'worldWikiArticle',
					'worldDetails',
				],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as worldBulkApi }
export type BulkDeleteEntitiesApiResponse = unknown
export type BulkDeleteEntitiesApiArg = {
	/** Any string value */
	worldId: string
	body: {
		entities: string[]
	}
}
export const { useBulkDeleteEntitiesMutation } = injectedRtkApi
