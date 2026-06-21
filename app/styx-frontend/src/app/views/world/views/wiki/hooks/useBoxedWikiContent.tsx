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
	color: string | undefined
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

	const wrapperCache = useRef(new Map<object, BoxedWikiEntity>())

	return useMemo(() => {
		const prevCache = wrapperCache.current
		const nextCache = new Map<object, BoxedWikiEntity>()

		function stable(
			// id: string,
			identity: object,
			name: string,
			position: number,
			make: () => BoxedWikiEntity,
		): BoxedWikiEntity {
			const cached = prevCache.get(identity)
			if (cached && cached.name === name) {
				// Only position (or nothing) changed — update in place to keep position current
				// without creating a new object reference that would trigger rerenders.
				cached.position = position
				nextCache.set(identity, cached)
				return cached
			}
			const item = make()
			nextCache.set(identity, item)
			return item
		}

		const result: BoxedWikiEntity[] = []
		let hiddenEntities = 0
		for (const folder of folders) {
			if (filterFolderId !== undefined && folder.parentFolderId !== filterFolderId) {
				continue
			}
			result.push(
				stable(folder, folder.name, folder.parentFolderPosition, () => ({
					id: folder.id,
					type: 'folder',
					entity: folder,
					name: folder.name,
					position: folder.parentFolderPosition,
					color: folder.color,
				})),
			)
		}
		for (const article of articles) {
			if (filterFolderId !== undefined && article.parentFolderId !== filterFolderId) {
				continue
			}
			if (!visibleEntities.includes('article')) {
				hiddenEntities += 1
				continue
			}
			result.push(
				stable(article, article.name, article.parentFolderPosition, () => ({
					id: article.id,
					type: 'article',
					entity: article,
					name: article.name,
					position: article.parentFolderPosition,
					color: article.color,
				})),
			)
		}
		for (const actor of actors) {
			if (filterFolderId !== undefined && actor.parentFolderId !== filterFolderId) {
				continue
			}
			if (!visibleEntities.includes('actor')) {
				hiddenEntities += 1
				continue
			}
			result.push(
				stable(actor, actor.name, actor.parentFolderPosition, () => ({
					id: actor.id,
					type: 'actor',
					entity: actor,
					name: actor.name,
					position: actor.parentFolderPosition,
					color: actor.color,
				})),
			)
		}
		for (const event of events) {
			if (filterFolderId !== undefined && event.parentFolderId !== filterFolderId) {
				continue
			}
			if (!visibleEntities.includes('event')) {
				hiddenEntities += 1
				continue
			}
			result.push(
				stable(event, event.name, event.parentFolderPosition, () => ({
					id: event.id,
					type: 'event',
					entity: event,
					name: event.name,
					position: event.parentFolderPosition,
					color: event.color,
				})),
			)
		}
		for (const tag of tags) {
			if (filterFolderId !== undefined && tag.parentFolderId !== filterFolderId) {
				continue
			}
			if (!visibleEntities.includes('tag')) {
				hiddenEntities += 1
				continue
			}
			result.push(
				stable(tag, tag.name, tag.parentFolderPosition, () => ({
					id: tag.id,
					type: 'tag',
					entity: tag,
					name: tag.name,
					position: tag.parentFolderPosition,
					color: '#9f2261',
				})),
			)
		}

		wrapperCache.current = nextCache
		return {
			visibleEntities: result.sort((a, b) => a.position - b.position),
			hiddenCount: hiddenEntities,
		}
	}, [actors, articles, events, filterFolderId, folders, tags, visibleEntities])
}
