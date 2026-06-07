import { ActorDetails, WorldEvent, WorldTag } from '@api/types/worldTypes'
import { WikiArticle, WikiFolder } from '@api/types/worldWikiTypes'
import { useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'

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

	const wrapperCache = useRef(new Map<object, BoxedWikiEntity>())

	const combinedList = useMemo(() => {
		const prevCache = wrapperCache.current
		const nextCache = new Map<object, BoxedWikiEntity>()

		function stable(entity: object, make: () => BoxedWikiEntity): BoxedWikiEntity {
			const cached = prevCache.get(entity)
			if (cached) {
				nextCache.set(entity, cached)
				return cached
			}
			const item = make()
			nextCache.set(entity, item)
			return item
		}

		const result: BoxedWikiEntity[] = []
		for (const folder of folders) {
			if (filterFolderId !== undefined && folder.parentFolderId !== filterFolderId) {
				continue
			}
			result.push(
				stable(folder, () => ({
					id: folder.id,
					type: 'folder',
					entity: folder,
					name: folder.name,
					position: folder.parentFolderPosition,
				})),
			)
		}
		for (const article of articles) {
			if (filterFolderId !== undefined && article.parentFolderId !== filterFolderId) {
				continue
			}
			result.push(
				stable(article, () => ({
					id: article.id,
					type: 'article',
					entity: article,
					name: article.name,
					position: article.parentFolderPosition,
				})),
			)
		}
		for (const actor of actors) {
			if (filterFolderId !== undefined && actor.parentFolderId !== filterFolderId) {
				continue
			}
			result.push(
				stable(actor, () => ({
					id: actor.id,
					type: 'actor',
					entity: actor,
					name: actor.name,
					position: actor.parentFolderPosition,
				})),
			)
		}
		for (const event of events) {
			if (filterFolderId !== undefined && event.parentFolderId !== filterFolderId) {
				continue
			}
			result.push(
				stable(event, () => ({
					id: event.id,
					type: 'event',
					entity: event,
					name: event.name,
					position: event.parentFolderPosition,
				})),
			)
		}
		for (const tag of tags) {
			if (filterFolderId !== undefined && tag.parentFolderId !== filterFolderId) {
				continue
			}
			result.push(
				stable(tag, () => ({
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
	}, [actors, articles, events, filterFolderId, folders, tags])

	return combinedList
}
