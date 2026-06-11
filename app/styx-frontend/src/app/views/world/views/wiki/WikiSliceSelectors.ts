import { WikiEntityType } from '@api/types/worldTypes'
import { createSelector } from '@reduxjs/toolkit'

import { RootState } from '@/app/store'

export const getWikiState = (state: RootState) => state.wiki

export type WikiFolderCounts = Record<WikiEntityType, number> & { total: number }

function makeEmptyCounts(): WikiFolderCounts {
	return { article: 0, actor: 0, event: 0, tag: 0, folder: 0, total: 0 }
}

export const getWikiFolderCounts = createSelector(
	[
		(state: RootState) => state.wiki.articles,
		(state: RootState) => state.wiki.folders,
		(state: RootState) => state.world.actors,
		(state: RootState) => state.world.events,
		(state: RootState) => state.world.tags,
	],
	(articles, folders, actors, events, tags) => {
		const foldersById = new Map(folders.map((folder) => [folder.id, folder]))
		const counts = new Map<string, WikiFolderCounts>()

		function count(parentFolderId: string | null | undefined, type: WikiEntityType) {
			let current = parentFolderId ? foldersById.get(parentFolderId) : undefined
			while (current) {
				const entry = counts.get(current.id) ?? makeEmptyCounts()
				entry[type] += 1
				if (type !== 'folder') {
					entry.total += 1
				}
				counts.set(current.id, entry)
				current = current.parentFolderId ? foldersById.get(current.parentFolderId) : undefined
			}
		}

		for (const folder of folders) {
			count(folder.parentFolderId, 'folder')
		}
		for (const article of articles) {
			count(article.parentFolderId, 'article')
		}
		for (const actor of actors) {
			count(actor.parentFolderId, 'actor')
		}
		for (const event of events) {
			count(event.parentFolderId, 'event')
		}
		for (const tag of tags) {
			count(tag.parentFolderId, 'tag')
		}

		return counts
	},
)
