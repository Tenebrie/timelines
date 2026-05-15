import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['dataMigration', 'asset'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			validateImportUserData: build.mutation<ValidateImportUserDataApiResponse, ValidateImportUserDataApiArg>(
				{
					query: (queryArg) => ({
						url: `/api/import/user-data/validate`,
						method: 'POST',
						body: queryArg.body,
					}),
					invalidatesTags: ['dataMigration', 'asset'],
				},
			),
			importUserData: build.mutation<ImportUserDataApiResponse, ImportUserDataApiArg>({
				query: (queryArg) => ({ url: `/api/import/user-data/commit`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['dataMigration', 'asset'],
			}),
			exportUserData: build.mutation<ExportUserDataApiResponse, ExportUserDataApiArg>({
				query: () => ({ url: `/api/export/user-data`, method: 'POST' }),
				invalidatesTags: ['dataMigration', 'asset'],
			}),
			exportUserDataInline: build.mutation<ExportUserDataInlineApiResponse, ExportUserDataInlineApiArg>({
				query: () => ({ url: `/api/export/user-data/inline`, method: 'POST' }),
				invalidatesTags: ['dataMigration'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as dataMigrationApi }
export type ValidateImportUserDataApiResponse = unknown
export type ValidateImportUserDataApiArg = {
	body: {
		assetId: string
	}
}
export type ImportUserDataApiResponse = unknown
export type ImportUserDataApiArg = {
	body: {
		assetId: string
	}
}
export type ExportUserDataApiResponse = /** status 200  */ {
	url: string
}
export type ExportUserDataApiArg = void
export type ExportUserDataInlineApiResponse = /** status 200  */ {
	version: number
	user: {
		id: string
		calendars: {
			units: {
				children: {
					id: string
					createdAt: string
					updatedAt: string
					calendarId: string
					position: number
					label?: null | string
					shortLabel?: null | string
					repeats: number
					parentUnitId: string
					childUnitId: string
				}[]
				id: string
				createdAt: string
				updatedAt: string
				name: string
				calendarId: string
				position: number
				displayName?: null | string
				displayNameShort?: null | string
				displayNamePlural?: null | string
				formatMode: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
				formatShorthand?: null | string
				negativeFormat: 'MinusSign' | 'AbsoluteValue'
				duration: string
				treeDepth: number
			}[]
			presentations: {
				units: {
					id: string
					createdAt: string
					updatedAt: string
					name: string
					calendarId: string
					presentationId: string
					position: number
					formatString: string
					subdivision: number
					labeledIndices: number[]
					unitId: string
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
				calendarId: string
				position: number
				formatShorthand?: null | string
			}[]
			description: string
			worldId?: null | string
			id: string
			createdAt: string
			updatedAt: string
			name: string
			ownerId?: null | string
			position: number
			originTime: string
			dateFormat?: null | string
		}[]
		worlds: {
			calendars: {
				units: {
					children: {
						id: string
						createdAt: string
						updatedAt: string
						calendarId: string
						position: number
						label?: null | string
						shortLabel?: null | string
						repeats: number
						parentUnitId: string
						childUnitId: string
					}[]
					id: string
					createdAt: string
					updatedAt: string
					name: string
					calendarId: string
					position: number
					displayName?: null | string
					displayNameShort?: null | string
					displayNamePlural?: null | string
					formatMode: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
					formatShorthand?: null | string
					negativeFormat: 'MinusSign' | 'AbsoluteValue'
					duration: string
					treeDepth: number
				}[]
				presentations: {
					units: {
						id: string
						createdAt: string
						updatedAt: string
						name: string
						calendarId: string
						presentationId: string
						position: number
						formatString: string
						subdivision: number
						labeledIndices: number[]
						unitId: string
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
					calendarId: string
					position: number
					formatShorthand?: null | string
				}[]
				description: string
				worldId?: null | string
				id: string
				createdAt: string
				updatedAt: string
				name: string
				ownerId?: null | string
				position: number
				originTime: string
				dateFormat?: null | string
			}[]
			actors: {
				pages: {
					description: string
					id: string
					createdAt: string
					updatedAt: string
					name: string
					descriptionRich: string
					parentActorId?: null | string
					parentEventId?: null | string
					parentArticleId?: null | string
				}[]
				mentions: {
					pageId?: null | string
					sourceId: string
					targetId: string
					sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
					targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
					sourceActorId?: null | string
					sourceEventId?: null | string
					sourceArticleId?: null | string
					sourceTagId?: null | string
					targetActorId?: null | string
					targetEventId?: null | string
					targetArticleId?: null | string
					targetTagId?: null | string
				}[]
				description: string
				worldId: string
				id: string
				createdAt: string
				updatedAt: string
				name: string
				title: string
				icon: string
				color: string
				descriptionRich: string
			}[]
			events: {
				mentions: {
					pageId?: null | string
					sourceId: string
					targetId: string
					sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
					targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
					sourceActorId?: null | string
					sourceEventId?: null | string
					sourceArticleId?: null | string
					sourceTagId?: null | string
					targetActorId?: null | string
					targetEventId?: null | string
					targetArticleId?: null | string
					targetTagId?: null | string
				}[]
				description: string
				worldId: string
				id: string
				createdAt: string
				updatedAt: string
				name: string
				icon: string
				color: string
				descriptionRich: string
				timestamp: string
				revokedAt?: null | string
				worldEventTrackId?: null | string
			}[]
			articles: {
				pages: {
					description: string
					id: string
					createdAt: string
					updatedAt: string
					name: string
					descriptionRich: string
					parentActorId?: null | string
					parentEventId?: null | string
					parentArticleId?: null | string
				}[]
				mentions: {
					pageId?: null | string
					sourceId: string
					targetId: string
					sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
					targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
					sourceActorId?: null | string
					sourceEventId?: null | string
					sourceArticleId?: null | string
					sourceTagId?: null | string
					targetActorId?: null | string
					targetEventId?: null | string
					targetArticleId?: null | string
					targetTagId?: null | string
				}[]
				worldId: string
				id: string
				createdAt: string
				updatedAt: string
				name: string
				icon: string
				color: string
				position: number
				contentRich: string
				parentId?: null | string
			}[]
			tags: {
				mentions: {
					pageId?: null | string
					sourceId: string
					targetId: string
					sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
					targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
					sourceActorId?: null | string
					sourceEventId?: null | string
					sourceArticleId?: null | string
					sourceTagId?: null | string
					targetActorId?: null | string
					targetEventId?: null | string
					targetArticleId?: null | string
					targetTagId?: null | string
				}[]
				description: string
				worldId: string
				id: string
				createdAt: string
				updatedAt: string
				name: string
			}[]
			mindmapNodes: {
				links: {
					id: string
					createdAt: string
					updatedAt: string
					content: string
					direction: 'Normal' | 'Reversed' | 'TwoWay'
					sourceNodeId: string
					targetNodeId: string
				}[]
				worldId: string
				id: string
				createdAt: string
				updatedAt: string
				parentActorId?: null | string
				positionX: number
				positionY: number
			}[]
			worldEventTracks: {
				worldId: string
				id: string
				createdAt: string
				updatedAt: string
				name: string
				position: number
				visible: boolean
			}[]
			worldCommonIconSets: {
				worldId: string
				id: string
				iconSet: string
			}[]
			savedColors: {
				worldId: string
				id: string
				createdAt: string
				updatedAt: string
				value: string
				label?: null | string
			}[]
			description: string
			id: string
			createdAt: string
			updatedAt: string
			name: string
			calendar?: null | 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
			timeOrigin: string
			ownerId: string
			accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
		}[]
	}
}
export type ExportUserDataInlineApiArg = void
export const {
	useValidateImportUserDataMutation,
	useImportUserDataMutation,
	useExportUserDataMutation,
	useExportUserDataInlineMutation,
} = injectedRtkApi
