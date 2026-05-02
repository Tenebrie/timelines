import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['dataMigration'] as const
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
					invalidatesTags: ['dataMigration'],
				},
			),
			importUserData: build.mutation<ImportUserDataApiResponse, ImportUserDataApiArg>({
				query: (queryArg) => ({ url: `/api/import/user-data/commit`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['dataMigration'],
			}),
			exportUserData: build.mutation<ExportUserDataApiResponse, ExportUserDataApiArg>({
				query: () => ({ url: `/api/export/user-data`, method: 'POST' }),
				invalidatesTags: ['dataMigration'],
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
					position: number
					calendarId: string
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
			createdAt: string
			updatedAt: string
			name: string
			ownerId?: null | string
			position: number
			description: string
			worldId?: null | string
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
						position: number
						calendarId: string
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
				createdAt: string
				updatedAt: string
				name: string
				ownerId?: null | string
				position: number
				description: string
				worldId?: null | string
				originTime: string
				dateFormat?: null | string
			}[]
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
				createdAt: string
				updatedAt: string
				name: string
				description: string
				worldId: string
			}[]
			savedColors: {
				id: string
				createdAt: string
				updatedAt: string
				label?: null | string
				worldId: string
				value: string
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
				pages: {
					id: string
					createdAt: string
					updatedAt: string
					name: string
					description: string
					descriptionRich: string
					parentActorId?: null | string
					parentEventId?: null | string
					parentArticleId?: null | string
				}[]
				id: string
				createdAt: string
				updatedAt: string
				name: string
				description: string
				worldId: string
				descriptionRich: string
				title: string
				icon: string
				color: string
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
				createdAt: string
				updatedAt: string
				name: string
				description: string
				worldId: string
				descriptionRich: string
				icon: string
				color: string
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
					createdAt: string
					updatedAt: string
					name: string
					description: string
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
			createdAt: string
			updatedAt: string
			name: string
			ownerId: string
			calendar?: null | 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
			description: string
			accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
			timeOrigin: string
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
