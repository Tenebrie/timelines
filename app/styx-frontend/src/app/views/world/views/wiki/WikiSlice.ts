import { WikiArticle, WikiFolder, WikiPositionUpdate } from '@api/types/worldWikiTypes'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export const initialState = {
	articles: [] as WikiArticle[],
	folders: [] as WikiFolder[],
	lastCheckedArticle: null as string | null,
	isBulkSelecting: false as boolean,
	bulkActionArticles: [] as string[],
}

export const wikiSlice = createSlice({
	name: 'worldWiki',
	initialState,
	reducers: {
		addArticles: (state, { payload }: PayloadAction<{ articles: WikiArticle[] }>) => {
			state.articles = state.articles.filter(
				(existing) => !payload.articles.some((payload) => payload.id === existing.id),
			)
			state.articles = [...state.articles, ...payload.articles]
		},
		loadArticles: (state, { payload }: PayloadAction<{ articles: WikiArticle[] }>) => {
			state.articles = payload.articles
		},

		loadFolders: (state, { payload }: PayloadAction<{ folders: WikiFolder[] }>) => {
			state.folders = payload.folders
		},

		setLastCheckedArticle: (state, { payload }: PayloadAction<{ article: string | null }>) => {
			state.lastCheckedArticle = payload.article
		},

		setBulkSelecting: (state, { payload }: PayloadAction<boolean>) => {
			state.isBulkSelecting = payload
		},

		addToBulkSelection: (state, { payload }: PayloadAction<{ articles: string[] }>) => {
			state.isBulkSelecting = true
			state.bulkActionArticles = [...state.bulkActionArticles, ...payload.articles]
		},

		removeFromBulkSelection: (state, { payload }: PayloadAction<{ articles: string[] }>) => {
			state.bulkActionArticles = state.bulkActionArticles.filter(
				(article) => !payload.articles.includes(article),
			)
		},

		clearBulkSelection: (state) => {
			state.bulkActionArticles = []
		},

		applyPositionUpdates: (state, { payload }: PayloadAction<{ updates: WikiPositionUpdate[] }>) => {
			type ArticleDraft = (typeof state)['articles'][number]
			type FolderDraft = (typeof state)['folders'][number]
			function apply(entity: ArticleDraft | FolderDraft | undefined, update: WikiPositionUpdate) {
				if (!entity) {
					return
				}
				if (update.folderId !== undefined) {
					entity.parentFolderId = update.folderId
				}
				entity.parentFolderPosition = update.position
			}
			payload.updates.forEach((update) => {
				if (update.entityType === 'article') {
					const article = state.articles.find((a) => a.id === update.entityId)
					apply(article, update)
				} else if (update.entityType === 'folder') {
					const folder = state.folders.find((f) => f.id === update.entityId)
					apply(folder, update)
				}
			})
		},
	},
})

export type ModalsState = typeof initialState
export const modalsInitialState = initialState
export const WikiReducer = wikiSlice.reducer
