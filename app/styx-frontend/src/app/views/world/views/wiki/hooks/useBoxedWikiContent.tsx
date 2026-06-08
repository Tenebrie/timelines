import { ActorDetails, WorldEvent, WorldTag } from '@api/types/worldTypes'
import { WikiArticle, WikiFolder } from '@api/types/worldWikiTypes'
import { useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'

import { getWikiPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { getWikiState } from '../WikiSliceSelectors'

type EntityWrapper =
	| {
			type: 'article'
			entity: WikiArticle
	  }
	| {
			type: 'actor'
			entity: ActorDetails
	  }
	| {
			type: 'event'
			entity: WorldEvent
	  }
	| {
			type: 'tag'
			entity: WorldTag
	  }
	| {
			type: 'folder'
			entity: WikiFolder
	  }

export type BoxedWikiEntity = EntityWrapper & {
	id: string
	name: string
	position: number
}

type Props = {
	filterFolderId?: string | null
}

export function useBoxedWikiContent({ filterFolderId }: Props = {}) {
	const { articles, folders } = useSelector(
		getWikiState,
		(a, b) => a.articles === b.articles && a.folders === b.folders,
	)
	const { actors, events, tags } = useSelector(
		getWorldState,
		(a, b) => a.actors === b.actors && a.events === b.events && a.tags === b.tags,
	)
	const { visibleEntities } = useSelector(
		getWikiPreferences,
		(a, b) => a.visibleEntities === b.visibleEntities,
	)

	const wrapperCache = useRef(new Map<string, BoxedWikiEntity>())

	const combinedList = useMemo(() => {
		const prevCache = wrapperCache.current
		const nextCache = new Map<string, BoxedWikiEntity>()

		function stable(
			id: string,
			name: string,
			position: number,
			make: () => BoxedWikiEntity,
		): BoxedWikiEntity {
			const cached = prevCache.get(id)
			if (cached && cached.name === name) {
				// Only position (or nothing) changed — update in place to keep position current
				// without creating a new object reference that would trigger rerenders.
				cached.position = position
				nextCache.set(id, cached)
				return cached
			}
			const item = make()
			nextCache.set(id, item)
			return item
		}

		const result: BoxedWikiEntity[] = []
		for (const folder of folders) {
			if (filterFolderId !== undefined && folder.parentFolderId !== filterFolderId) {
				continue
			}
			result.push(
				stable(folder.id, folder.name, folder.parentFolderPosition, () => ({
					id: folder.id,
					type: 'folder',
					entity: folder,
					name: folder.name,
					position: folder.parentFolderPosition,
				})),
			)
		}
		for (const article of articles) {
			if (!visibleEntities.includes('article')) {
				continue
			}
			if (filterFolderId !== undefined && article.parentFolderId !== filterFolderId) {
				continue
			}
			result.push(
				stable(article.id, article.name, article.parentFolderPosition, () => ({
					id: article.id,
					type: 'article',
					entity: article,
					name: article.name,
					position: article.parentFolderPosition,
				})),
			)
		}
		for (const actor of actors) {
			if (!visibleEntities.includes('actor')) {
				continue
			}
			if (filterFolderId !== undefined && actor.parentFolderId !== filterFolderId) {
				continue
			}
			result.push(
				stable(actor.id, actor.name, actor.parentFolderPosition, () => ({
					id: actor.id,
					type: 'actor',
					entity: actor,
					name: actor.name,
					position: actor.parentFolderPosition,
				})),
			)
		}
		for (const event of events) {
			if (!visibleEntities.includes('event')) {
				continue
			}
			if (filterFolderId !== undefined && event.parentFolderId !== filterFolderId) {
				continue
			}
			result.push(
				stable(event.id, event.name, event.parentFolderPosition, () => ({
					id: event.id,
					type: 'event',
					entity: event,
					name: event.name,
					position: event.parentFolderPosition,
				})),
			)
		}
		for (const tag of tags) {
			if (!visibleEntities.includes('tag')) {
				continue
			}
			if (filterFolderId !== undefined && tag.parentFolderId !== filterFolderId) {
				continue
			}
			result.push(
				stable(tag.id, tag.name, tag.parentFolderPosition, () => ({
					id: tag.id,
					type: 'tag',
					entity: tag,
					name: tag.name,
					position: tag.parentFolderPosition,
				})),
			)
		}

		wrapperCache.current = nextCache
		return result.sort((a, b) => a.position - b.position)
	}, [actors, articles, events, filterFolderId, folders, tags, visibleEntities])

	return combinedList
}
