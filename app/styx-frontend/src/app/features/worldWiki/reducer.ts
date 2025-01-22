import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export const initialState = {
	lastCheckedArticle: null as string | null,
	bulkActionArticles: [] as string[],
}

export const wikiSlice = createSlice({
	name: 'worldWiki',
	initialState,
	reducers: {
		setLastCheckedArticle: (state, { payload }: PayloadAction<{ article: string | null }>) => {
			state.lastCheckedArticle = payload.article
		},

		addToBulkSelection: (state, { payload }: PayloadAction<{ articles: string[] }>) => {
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
export default wikiSlice.reducer
