import Divider from '@mui/material/Divider'
import { useCallback } from 'react'

import { useQuickCreateActor } from '@/api/hooks/useQuickCreateActor'
import { useQuickCreateArticle } from '@/api/hooks/useQuickCreateArticle'
import { useQuickCreateEvent } from '@/api/hooks/useQuickCreateEvent'
import { useQuickCreateTag } from '@/api/hooks/useQuickCreateTag'
import { MentionedEntity } from '@/api/types/worldTypes'

import { QuickSelectListCreateItem } from './QuickSelectListCreateItem'
import { QuickSelectListSectionHeader } from './QuickSelectListSectionHeader'

type Props = {
	query: string
	onCreatePlainNode?: (name: string) => void
	onSelect: (params: { query: string; entity: { id: string; type: MentionedEntity; name: string } }) => void
	mentionCount: number
	selectedIndex: number
}

export function getQuickCreateTypes(hasPlainNode: boolean) {
	return hasPlainNode
		? (['Node', 'Actor', 'Event', 'Article', 'Tag'] as const)
		: (['Actor', 'Event', 'Article', 'Tag'] as const)
}

type QuickCreateType = ReturnType<typeof getQuickCreateTypes>[number]

export function QuickSelectListCreate({
	query,
	onCreatePlainNode,
	onSelect,
	mentionCount,
	selectedIndex,
}: Props) {
	const createActor = useQuickCreateActor()
	const createEvent = useQuickCreateEvent()
	const createArticle = useQuickCreateArticle()
	const createTag = useQuickCreateTag()

	const selectCreated = useCallback(
		(type: MentionedEntity, id: string) => {
			onSelect({ query, entity: { id, type, name: query } })
		},
		[onSelect, query],
	)

	const handlers: Record<QuickCreateType, () => void> = {
		Node: () => onCreatePlainNode?.(query),
		Actor: async () => {
			const actor = await createActor({ query })
			if (actor) {
				selectCreated('Actor', actor.id)
			}
		},
		Event: async () => {
			const event = await createEvent({ query })
			if (event) {
				selectCreated('Event', event.id)
			}
		},
		Article: async () => {
			const article = await createArticle({ query })
			if (article) {
				selectCreated('Article', article.id)
			}
		},
		Tag: async () => {
			const tag = await createTag({ query })
			if (tag) {
				selectCreated('Tag', tag.id)
			}
		},
	}

	return (
		<>
			<QuickSelectListSectionHeader label="Quick create" disableGutter={mentionCount === 0} />
			<Divider style={{ marginBottom: 0 }} />
			{getQuickCreateTypes(!!onCreatePlainNode).map((type, index) => (
				<QuickSelectListCreateItem
					key={type}
					type={type}
					selected={selectedIndex === mentionCount + index}
					onClick={handlers[type]}
					query={query}
				/>
			))}
		</>
	)
}
