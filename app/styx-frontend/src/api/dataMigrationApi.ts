import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['dataMigration'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			importUserData: build.mutation<ImportUserDataApiResponse, ImportUserDataApiArg>({
				query: (queryArg) => ({ url: `/api/import/user-data`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['dataMigration'],
			}),
			exportUserData: build.mutation<ExportUserDataApiResponse, ExportUserDataApiArg>({
				query: () => ({ url: `/api/export/user-data`, method: 'POST' }),
				invalidatesTags: ['dataMigration'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as dataMigrationApi }
export type ImportUserDataApiResponse = unknown
export type ImportUserDataApiArg = {
	body: {
		data: {
			data: string
		}
	}
}
export type ExportUserDataApiResponse = /** status 200  */ {
	version: number
	user: {
		id: string
		calendars: {
			units: {
				children: {
					id: string
					createdAt: string
					updatedAt: string
					label?: null | string
					position: number
					calendarId: string
					shortLabel?: null | string
					repeats: number
					parentUnitId: string
					childUnitId: string
				}[]
				id: string
				createdAt: string
				updatedAt: string
				name: string
				position: number
				calendarId: string
				formatMode: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
				negativeFormat: 'MinusSign' | 'AbsoluteValue'
				displayName?: null | string
				displayNameShort?: null | string
				displayNamePlural?: null | string
				formatShorthand?: null | string
				duration: string
				treeDepth: number
			}[]
			seasons: {
				intervals: {
					id: string
					createdAt: string
					updatedAt: string
					calendarId: string
					leftIndex: number
					rightIndex: number
					seasonId: string
				}[]
				id: string
				createdAt: string
				updatedAt: string
				name: string
				position: number
				calendarId: string
				formatShorthand?: null | string
			}[]
			presentations: {
				units: {
					id: string
					createdAt: string
					updatedAt: string
					name: string
					position: number
					calendarId: string
					formatString: string
					subdivision: number
					labeledIndices: number[]
					unitId: string
					presentationId: string
				}[]
				id: string
				createdAt: string
				updatedAt: string
				name: string
				calendarId: string
				compression: number
				scaleFactor: number
				baselineUnitId?: null | string
			}[]
			id: string
			description: string
			createdAt: string
			updatedAt: string
			name: string
			position: number
			worldId?: null | string
			ownerId?: null | string
			originTime: string
			dateFormat?: null | string
		}[]
		worlds: {
			tags: {
				mentions: {
					sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
					targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
					sourceId: string
					targetId: string
					sourceActorId?: null | string
					sourceEventId?: null | string
					sourceArticleId?: null | string
					sourceTagId?: null | string
					targetActorId?: null | string
					targetEventId?: null | string
					targetArticleId?: null | string
					targetTagId?: null | string
					pageId?: null | string
				}[]
				id: string
				description: string
				createdAt: string
				updatedAt: string
				name: string
				worldId: string
			}[]
			savedColors: {
				value: string
				id: string
				createdAt: string
				updatedAt: string
				label?: null | string
				worldId: string
			}[]
			worldCommonIconSets: {
				id: string
				worldId: string
				iconSet: string
			}[]
			worldEventTracks: {
				id: string
				createdAt: string
				updatedAt: string
				name: string
				position: number
				worldId: string
				visible: boolean
			}[]
			actors: {
				mentions: {
					sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
					targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
					sourceId: string
					targetId: string
					sourceActorId?: null | string
					sourceEventId?: null | string
					sourceArticleId?: null | string
					sourceTagId?: null | string
					targetActorId?: null | string
					targetEventId?: null | string
					targetArticleId?: null | string
					targetTagId?: null | string
					pageId?: null | string
				}[]
				id: string
				title: string
				description: string
				createdAt: string
				updatedAt: string
				name: string
				worldId: string
				icon: string
				color: string
				descriptionRich: string
			}[]
			events: {
				mentions: {
					sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
					targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
					sourceId: string
					targetId: string
					sourceActorId?: null | string
					sourceEventId?: null | string
					sourceArticleId?: null | string
					sourceTagId?: null | string
					targetActorId?: null | string
					targetEventId?: null | string
					targetArticleId?: null | string
					targetTagId?: null | string
					pageId?: null | string
				}[]
				id: string
				description: string
				createdAt: string
				updatedAt: string
				name: string
				worldId: string
				icon: string
				color: string
				descriptionRich: string
				timestamp: string
				revokedAt?: null | string
				worldEventTrackId?: null | string
			}[]
			articles: {
				mentions: {
					sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
					targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
					sourceId: string
					targetId: string
					sourceActorId?: null | string
					sourceEventId?: null | string
					sourceArticleId?: null | string
					sourceTagId?: null | string
					targetActorId?: null | string
					targetEventId?: null | string
					targetArticleId?: null | string
					targetTagId?: null | string
					pageId?: null | string
				}[]
				pages: {
					id: string
					description: string
					createdAt: string
					updatedAt: string
					name: string
					descriptionRich: string
					parentActorId?: null | string
					parentEventId?: null | string
					parentArticleId?: null | string
				}[]
				id: string
				createdAt: string
				updatedAt: string
				name: string
				position: number
				worldId: string
				icon: string
				color: string
				contentRich: string
				parentId?: null | string
			}[]
			mindmapNodes: {
				links: {
					id: string
					createdAt: string
					updatedAt: string
					direction: 'Normal' | 'Reversed' | 'TwoWay'
					sourceNodeId: string
					targetNodeId: string
					content: string
				}[]
				id: string
				createdAt: string
				updatedAt: string
				worldId: string
				parentActorId?: null | string
				positionX: number
				positionY: number
			}[]
			id: string
			description: string
			createdAt: string
			updatedAt: string
			name: string
			calendar?: null | 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
			ownerId: string
			accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
			timeOrigin: string
		}[]
	}
}
export type ExportUserDataApiArg = void
export const { useImportUserDataMutation, useExportUserDataMutation } = injectedRtkApi
