import { MentionedEntity } from '@api/types/worldTypes'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Editor } from '@tiptap/react'
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { Shortcut, ShortcutPriorities, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { useCreateArticle } from '@/app/views/world/views/wiki/api/useCreateArticle'

import { useQuickCreateActor } from './api/useQuickCreateActor'
import { useQuickCreateEvent } from './api/useQuickCreateEvent'
import { useQuickCreateTag } from './api/useQuickCreateTag'
import { MentionNodeName } from './components/MentionNode'
import { Mention, useDisplayedMentions } from './hooks/useDisplayedMentions'
import { MentionsListItem } from './MentionsListItem'
import { MentionsListItemQuickCreate } from './MentionsListItemQuickCreate'
import { MentionsListSectionHeader } from './MentionsListSectionHeader'

type Props = {
	editor: Editor | null
}

export const MentionsList = memo(MentionsListComponent)

export function MentionsListComponent({ editor }: Props) {
	const [visible, setVisible] = useState(false)
	const [pos, setPos] = useState<{ top: number; bottom: number; left: number }>({
		top: 0,
		bottom: 0,
		left: 0,
	})
	const [query, setQuery] = useState('')
	const [selectedIndex, setSelectedIndex] = useState(0)

	const { mentions, actorCount, eventCount, articleCount, tagCount } = useDisplayedMentions({ query })

	const createActor = useQuickCreateActor()
	const createEvent = useQuickCreateEvent()
	const [createArticle] = useCreateArticle()
	const createTag = useQuickCreateTag()

	const quickCreateVisible = query.length > 0
	const lastItemIndex = quickCreateVisible ? mentions.length + 3 : mentions.length - 1

	// Handle closing through global shortcut system to avoid modal closing
	useShortcut(
		Shortcut.Escape,
		() => {
			if (visible) {
				setVisible(false)
				setSelectedIndex(0)
			}
		},
		visible && ShortcutPriorities.Mentions,
	)

	useEventBusSubscribe['richEditor/requestOpenMentions']({
		callback: ({ query, screenPosTop, screenPosBottom, screenPosLeft }) => {
			if (!editor) {
				return
			}
			setVisible(true)
			setQuery(query)
			setPos({
				top: screenPosTop,
				bottom: screenPosBottom,
				left: screenPosLeft,
			})
		},
	})
	useEventBusSubscribe['richEditor/requestUpdateMentions']({
		callback: ({ query, screenPosTop, screenPosBottom, screenPosLeft }) => {
			setQuery(query)
			setPos({
				top: screenPosTop,
				bottom: screenPosBottom,
				left: screenPosLeft,
			})
		},
	})
	useEventBusSubscribe['richEditor/requestCloseMentions']({
		callback: () => {
			setVisible(false)
			setSelectedIndex(0)
		},
	})

	const selectEntity = async (editor: Editor | null, index: number) => {
		const selectedMention = mentions[index]
		if (!editor) {
			return
		}

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

		// Determine the entity name for the mention
		const entityId = createdEntityId ?? selectedMention.id

		editor
			.chain()
			.focus()
			.deleteRange({
				from: editor.state.selection.from - query.length - 1,
				to: editor.state.selection.from,
			})
			.insertContent({
				type: MentionNodeName,
				attrs: {
					type: 'mention',
					name: selectedMention?.name ?? query,
					componentProps: {
						[entityType.toLowerCase()]: entityId,
					},
				},
			})
			.insertContent(' ')
			.run()
	}

	useEventBusSubscribe['richEditor/onKeyDown']({
		callback: async ({ editor: targetEditor, key, shiftKey }) => {
			if (targetEditor !== editor) {
				return
			}
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
				await selectEntity(editor, selectedIndex)
			} else if (key === 'PageUp') {
				setSelectedIndex(0)
			} else if (key === 'PageDown') {
				setSelectedIndex(lastItemIndex)
			}
		},
	})

	const oldMentions = useRef(mentions)
	useEffect(() => {
		if (oldMentions.current.length !== mentions.length) {
			setSelectedIndex(0)
		}
		oldMentions.current = mentions
	}, [mentions, visible])

	const [adjustedTop, setAdjustedTop] = useState(pos.top)
	const [adjustedLeft, setAdjustedLeft] = useState(pos.left)
	const paperRef = useRef<HTMLDivElement>(null)

	const recalculatePosition = useCallback(() => {
		const el = paperRef.current
		if (!el || !visible) {
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
			// Position above the cursor
			setAdjustedTop(Math.max(0, pos.top - elHeight))
		} else {
			setAdjustedTop(currentBottom)
		}
	}, [visible, pos.bottom, pos.left, pos.top])

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
			sx={{
				outline: `1px solid ${theme.material.palette.divider}`,
				zIndex: 10,
				position: 'fixed',
				top: adjustedTop,
				left: adjustedLeft,
				display: visible ? 'block' : 'none',
				minWidth: '350px',
			}}
		>
			{mentionTypes
				.filter((type) => type.mentions.length > 0)
				.map((type) => (
					<Stack gap={0} key={type.label}>
						<MentionsListSectionHeader
							label={type.label}
							key={type.label}
							mentionCount={type.totalCount}
							disableGutter={type.indexStart === 0}
						/>
						<Divider style={{ marginBottom: 0 }} />
						{type.mentions.map((mention, index) => (
							<MentionsListItem
								key={mention.id}
								mention={mention}
								query={query}
								selected={selectedIndex === index + type.indexStart}
								onClick={() => selectEntity(editor, index + type.indexStart)}
							/>
						))}
					</Stack>
				))}
			{query.trim().length > 0 && (
				<>
					<MentionsListSectionHeader label="Quick create" disableGutter={mentions.length === 0} />
					<Divider style={{ marginBottom: 0 }} />
					<MentionsListItemQuickCreate
						type="Actor"
						selected={selectedIndex === mentions.length}
						onClick={() => selectEntity(editor, mentions.length)}
						query={query}
					/>
					<MentionsListItemQuickCreate
						type="Event"
						selected={selectedIndex === mentions.length + 1}
						onClick={() => selectEntity(editor, mentions.length + 1)}
						query={query}
					/>
					<MentionsListItemQuickCreate
						type="Article"
						selected={selectedIndex === mentions.length + 2}
						onClick={() => selectEntity(editor, mentions.length + 2)}
						query={query}
					/>
					<MentionsListItemQuickCreate
						type="Tag"
						selected={selectedIndex === mentions.length + 3}
						onClick={() => selectEntity(editor, mentions.length + 3)}
						query={query}
					/>
				</>
			)}
		</Paper>
	)
}
