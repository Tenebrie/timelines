import { MentionedEntity } from '@api/types/worldTypes'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useQuickCreateActor } from '@/api/hooks/useQuickCreateActor'
import { useQuickCreateEvent } from '@/api/hooks/useQuickCreateEvent'
import { useQuickCreateTag } from '@/api/hooks/useQuickCreateTag'
import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { Shortcut, ShortcutPriorities, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { useCreateArticle } from '@/app/views/world/views/wiki/api/useCreateArticle'

import {
	Mention,
	useDisplayedMentions,
} from '../../features/richTextEditor/extensions/mentions/hooks/useDisplayedMentions'
import { QuickSelectListItem } from './QuickSelectListItem'
import { QuickSelectListItemQuickCreate } from './QuickSelectListItemQuickCreate'
import { QuickSelectListSectionHeader } from './QuickSelectListSectionHeader'

type Props = {
	isFocused: boolean
	onSelect: (params: { query: string; entity: { id: string; type: MentionedEntity; name: string } }) => void
}

type Position = { top: number; bottom: number; left: number }

export const QuickSelectList = memo(QuickSelectListComponent)

export function QuickSelectListComponent({ isFocused, onSelect }: Props) {
	const [visible, setVisible] = useState(false)
	const [pos, setPos] = useState<Position>({ top: 0, bottom: 0, left: 0 })
	const [query, setQuery] = useState('')

	useShortcut(
		Shortcut.Escape,
		() => {
			setVisible(false)
		},
		visible && ShortcutPriorities.Mentions,
	)

	useEventBusSubscribe['quickSelect/requestOpen']({
		callback: ({ query, screenPosTop, screenPosBottom, screenPosLeft }) => {
			setVisible(true)
			setQuery(query)
			setPos({ top: screenPosTop, bottom: screenPosBottom, left: screenPosLeft })
		},
	})
	useEventBusSubscribe['quickSelect/requestUpdate']({
		callback: ({ query, screenPosTop, screenPosBottom, screenPosLeft }) => {
			setQuery(query)
			setPos({ top: screenPosTop, bottom: screenPosBottom, left: screenPosLeft })
		},
	})
	useEventBusSubscribe['quickSelect/requestClose']({
		callback: () => {
			setVisible(false)
		},
	})

	if (!visible || !isFocused) {
		return null
	}

	return (
		<QuickSelectListContent pos={pos} query={query} onSelect={onSelect} onClose={() => setVisible(false)} />
	)
}

type ContentProps = {
	pos: Position
	query: string
	onSelect: (params: { query: string; entity: { id: string; type: MentionedEntity; name: string } }) => void
	onClose: () => void
}

function QuickSelectListContent({ pos, query, onSelect, onClose }: ContentProps) {
	const [selectedIndex, setSelectedIndex] = useState(0)

	const { mentions, actorCount, eventCount, articleCount, tagCount } = useDisplayedMentions({ query })

	const createActor = useQuickCreateActor()
	const createEvent = useQuickCreateEvent()
	const [createArticle] = useCreateArticle()
	const createTag = useQuickCreateTag()

	const quickCreateVisible = query.length > 0
	const lastItemIndex = quickCreateVisible ? mentions.length + 3 : mentions.length - 1

	useShortcut(
		Shortcut.Escape,
		() => {
			onClose()
			setSelectedIndex(0)
		},
		ShortcutPriorities.Mentions,
	)

	const selectEntity = useCallback(
		async (index: number) => {
			const selectedMention = mentions[index]

			let entityType: MentionedEntity = selectedMention?.type
			let createdEntityId: string | undefined = undefined
			if (!selectedMention && index === mentions.length) {
				entityType = 'Actor'
				createdEntityId = (await createActor({ query }))?.id
			} else if (!selectedMention && index === mentions.length + 1) {
				entityType = 'Event'
				createdEntityId = (await createEvent({ query }))?.id
			} else if (!selectedMention && index === mentions.length + 2) {
				entityType = 'Article'
				createdEntityId = (await createArticle({ name: query }))?.id
			} else if (!selectedMention && index === mentions.length + 3) {
				entityType = 'Tag'
				createdEntityId = (await createTag({ query }))?.id
			}

			if (!selectedMention && !createdEntityId) {
				return
			}

			const entityId = createdEntityId ?? selectedMention.id

			onSelect({
				query,
				entity: {
					id: entityId,
					type: entityType,
					name: selectedMention?.name ?? query,
				},
			})
		},
		[createActor, createArticle, createEvent, createTag, mentions, onSelect, query],
	)

	const handleKeyPress = useCallback(
		async (key: string, shiftKey: boolean) => {
			if (key === 'ArrowUp' || (key === 'Tab' && shiftKey)) {
				setSelectedIndex((prev) => {
					return prev > 0 ? prev - 1 : lastItemIndex
				})
			} else if (key === 'ArrowDown' || key === 'Tab') {
				const maxIndex = mentions.length - (query.length > 0 ? -3 : 1)
				setSelectedIndex((prev) => {
					const targetIndex = prev + 1 > maxIndex ? 0 : prev + 1
					return targetIndex
				})
			} else if (key === 'Enter') {
				await selectEntity(selectedIndex)
			} else if (key === 'PageUp') {
				setSelectedIndex(0)
			} else if (key === 'PageDown') {
				setSelectedIndex(lastItemIndex)
			}
		},
		[lastItemIndex, mentions.length, query.length, selectEntity, selectedIndex],
	)

	useEventBusSubscribe['quickSelect/onKeyDown']({
		callback: async ({ key, shiftKey }) => {
			await handleKeyPress(key, shiftKey)
		},
	})

	const oldMentions = useRef(mentions)
	useEffect(() => {
		if (oldMentions.current.length !== mentions.length) {
			setSelectedIndex(0)
		}
		oldMentions.current = mentions
	}, [mentions])

	const [adjustedTop, setAdjustedTop] = useState(pos.top)
	const [adjustedLeft, setAdjustedLeft] = useState(pos.left)
	const paperRef = useRef<HTMLDivElement>(null)

	const recalculatePosition = useCallback(() => {
		const el = paperRef.current
		if (!el) {
			return
		}

		const elWidth = el.offsetWidth
		const elHeight = el.offsetHeight

		const currentLeft = pos.left
		const currentBottom = pos.bottom

		if (currentLeft + elWidth > window.innerWidth) {
			setAdjustedLeft(Math.max(0, pos.left - (currentLeft + elWidth - window.innerWidth)))
		} else {
			setAdjustedLeft(currentLeft)
		}

		if (currentBottom + elHeight > window.innerHeight) {
			setAdjustedTop(Math.max(0, pos.top - elHeight))
		} else {
			setAdjustedTop(currentBottom)
		}
	}, [pos.bottom, pos.left, pos.top])

	useLayoutEffect(() => {
		recalculatePosition()
	}, [recalculatePosition, mentions.length, query])

	const mentionTypes = [
		{
			label: 'Actors',
			mentions: mentions.filter((m) => m.type === 'Actor') as Mention[],
			indexStart: 0,
			totalCount: actorCount,
		},
	]
	mentionTypes.push({
		label: 'Events',
		mentions: mentions.filter((m) => m.type === 'Event'),
		indexStart: mentionTypes.reduce((acc, type) => acc + type.mentions.length, 0),
		totalCount: eventCount,
	})
	mentionTypes.push({
		label: 'Articles',
		mentions: mentions.filter((m) => m.type === 'Article'),
		indexStart: mentionTypes.reduce((acc, type) => acc + type.mentions.length, 0),
		totalCount: articleCount,
	})
	mentionTypes.push({
		label: 'Tags',
		mentions: mentions.filter((m) => m.type === 'Tag'),
		indexStart: mentionTypes.reduce((acc, type) => acc + type.mentions.length, 0),
		totalCount: tagCount,
	})
	const theme = useCustomTheme()

	return (
		<Paper
			ref={paperRef}
			onMouseDown={(event) => event.preventDefault()}
			sx={{
				outline: `1px solid ${theme.material.palette.divider}`,
				zIndex: 10,
				position: 'fixed',
				top: adjustedTop,
				left: adjustedLeft,
				minWidth: '350px',
			}}
		>
			{mentionTypes
				.filter((type) => type.mentions.length > 0)
				.map((type) => (
					<Stack gap={0} key={type.label}>
						<QuickSelectListSectionHeader
							label={type.label}
							key={type.label}
							mentionCount={type.totalCount}
							disableGutter={type.indexStart === 0}
						/>
						<Divider style={{ marginBottom: 0 }} />
						{type.mentions.map((mention, index) => (
							<QuickSelectListItem
								key={mention.id}
								mention={mention}
								query={query}
								selected={selectedIndex === index + type.indexStart}
								onClick={() => selectEntity(index + type.indexStart)}
							/>
						))}
					</Stack>
				))}
			{query.trim().length > 0 && (
				<>
					<QuickSelectListSectionHeader label="Quick create" disableGutter={mentions.length === 0} />
					<Divider style={{ marginBottom: 0 }} />
					<QuickSelectListItemQuickCreate
						type="Actor"
						selected={selectedIndex === mentions.length}
						onClick={() => selectEntity(mentions.length)}
						query={query}
					/>
					<QuickSelectListItemQuickCreate
						type="Event"
						selected={selectedIndex === mentions.length + 1}
						onClick={() => selectEntity(mentions.length + 1)}
						query={query}
					/>
					<QuickSelectListItemQuickCreate
						type="Article"
						selected={selectedIndex === mentions.length + 2}
						onClick={() => selectEntity(mentions.length + 2)}
						query={query}
					/>
					<QuickSelectListItemQuickCreate
						type="Tag"
						selected={selectedIndex === mentions.length + 3}
						onClick={() => selectEntity(mentions.length + 3)}
						query={query}
					/>
				</>
			)}
		</Paper>
	)
}
