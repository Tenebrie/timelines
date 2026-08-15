import { WikiEntityType } from '@api/types/worldTypes'
import { createSelector } from '@reduxjs/toolkit'

import { getWikiPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { RootState } from '@/app/store'

export const getWikiState = (state: RootState) => state.wiki
export const getWikiStateLoaded = createSelector(
	[getWikiState],
	(state) => state.articlesLoaded && state.foldersLoaded,
)

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
			const seen = new Set<string>()
			let current = parentFolderId ? foldersById.get(parentFolderId) : undefined
			while (current && !seen.has(current.id)) {
				seen.add(current.id)
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

type OrderedWikiEntity = {
	id: string
	parentId: string | null
	/** True when an ancestor folder is collapsed, i.e. the entity is not currently rendered. */
	hidden: boolean
}

/**
 * Single global pass producing every wiki entity in visual (pre-order) order, across all folders.
 * Entities whose type is filtered out of the sidebar are omitted; entities under a collapsed folder
 * are kept but flagged `hidden` so consumers can decide whether to include them.
 */
export const getOrderedWikiEntities = createSelector(
	[
		(state: RootState) => state.wiki.articles,
		(state: RootState) => state.wiki.folders,
		(state: RootState) => state.world.actors,
		(state: RootState) => state.world.events,
		(state: RootState) => state.world.tags,
		(state: RootState) => getWikiPreferences(state).expandedFolders,
		(state: RootState) => getWikiPreferences(state).visibleEntities,
	],
	(articles, folders, actors, events, tags, expandedFolders, visibleEntities) => {
		const childrenByParent = new Map<
			string | null,
			{ id: string; type: WikiEntityType; position: number }[]
		>()

		function register(
			type: WikiEntityType,
			entities: { id: string; parentFolderId?: string | null; parentFolderPosition: number }[],
		) {
			for (const entity of entities) {
				const parentId = entity.parentFolderId ?? null
				const siblings = childrenByParent.get(parentId) ?? []
				siblings.push({ id: entity.id, type, position: entity.parentFolderPosition })
				childrenByParent.set(parentId, siblings)
			}
		}

		register('folder', folders)
		if (visibleEntities.includes('article')) register('article', articles)
		if (visibleEntities.includes('actor')) register('actor', actors)
		if (visibleEntities.includes('event')) register('event', events)
		if (visibleEntities.includes('tag')) register('tag', tags)

		for (const siblings of childrenByParent.values()) {
			siblings.sort((a, b) => a.position - b.position)
		}

		const expanded = new Set(expandedFolders)
		const ordered: OrderedWikiEntity[] = []

		function walk(parentId: string | null, hidden: boolean) {
			const children = childrenByParent.get(parentId)
			if (!children) {
				return
			}
			for (const child of children) {
				ordered.push({ id: child.id, parentId, hidden })
				if (child.type === 'folder') {
					walk(child.id, hidden || !expanded.has(child.id))
				}
			}
		}
		walk(null, false)

		return ordered
	},
)

/** Entities currently rendered in the sidebar, in visual order. Used for shift-range selection. */
export const getVisibleOrderedWikiEntities = createSelector([getOrderedWikiEntities], (ordered) =>
	ordered.filter((entity) => !entity.hidden),
)

/** Ids of every wiki entity (all folders, collapsed or not), in visual order. Used for "select all". */
export const getAllWikiEntityIds = createSelector([getOrderedWikiEntities], (ordered) =>
	ordered.map((entity) => entity.id),
)
