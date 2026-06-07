import { WikiArticle, WikiFolder } from '@api/types/worldWikiTypes'
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
	},
})

export type ModalsState = typeof initialState
export const modalsInitialState = initialState
export const WikiReducer = wikiSlice.reducer
