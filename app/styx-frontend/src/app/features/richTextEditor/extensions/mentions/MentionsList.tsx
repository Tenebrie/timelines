import { MentionedEntity } from '@api/types/worldTypes'
import Article from '@mui/icons-material/Article'
import Event from '@mui/icons-material/Event'
import LabelIcon from '@mui/icons-material/Label'
import Person from '@mui/icons-material/Person'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import { Editor } from '@tiptap/react'
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { Shortcut, ShortcutPriorities, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { useCreateArticle } from '@/app/views/world/views/wiki/api/useCreateArticle'

import { useQuickCreateActor } from './api/useQuickCreateActor'
import { useQuickCreateEvent } from './api/useQuickCreateEvent'
import { useQuickCreateTag } from './api/useQuickCreateTag'
import { MentionNodeName } from './components/MentionNode'
import { useDisplayedMentions } from './hooks/useDisplayedMentions'

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

	const { mentions } = useDisplayedMentions({ query })

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
		visible && ShortcutPriorities.MENTIONS,
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
				setSelectedIndex((prev) => Math.max(prev - 1, 0))
			} else if (key === 'ArrowDown' || key === 'Tab') {
				setSelectedIndex((prev) => {
					return Math.min(prev + 1, mentions.length - (query.length > 0 ? -3 : 1))
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
	const paperRef = useRef<HTMLDivElement>(null)

	const recalculatePosition = useCallback(() => {
		const el = paperRef.current
		if (!el || !visible) {
			return
		}

		const belowTop = pos.bottom
		const elHeight = el.offsetHeight

		if (belowTop + elHeight > window.innerHeight) {
			// Position above the cursor
			setAdjustedTop(Math.max(0, pos.top - elHeight))
		} else {
			setAdjustedTop(belowTop)
		}
	}, [pos.top, pos.bottom, visible])

	useLayoutEffect(() => {
		recalculatePosition()
	}, [recalculatePosition, mentions.length, query])

	return (
		<Paper
			ref={paperRef}
			sx={{
				zIndex: 10,
				position: 'fixed',
				top: adjustedTop,
				left: pos.left,
				display: visible ? 'block' : 'none',
				minWidth: '200px',
			}}
		>
			{mentions.map((mention, index) => (
				<MenuItem
					selected={selectedIndex === index}
					key={mention.id}
					onClick={() => selectEntity(editor, index)}
					sx={{ borderRadius: 1 }}
				>
					<ListItemIcon>
						{mention.type === 'Actor' && <Person />}
						{mention.type === 'Event' && <Event />}
						{mention.type === 'Article' && <Article />}
						{mention.type === 'Tag' && <LabelIcon />}
					</ListItemIcon>
					<ListItemText>
						<b>{mention.type}:</b>&nbsp;{mention.name}
					</ListItemText>
				</MenuItem>
			))}
			{query.trim().length > 0 && (
				<>
					{mentions.length > 0 && <Divider />}
					<MenuItem disabled>
						<ListItemText>Create new</ListItemText>
					</MenuItem>
					<MenuItem
						selected={selectedIndex === mentions.length}
						onClick={() => selectEntity(editor, mentions.length)}
						sx={{ borderRadius: 1 }}
					>
						<ListItemIcon>
							<Person />
						</ListItemIcon>
						<ListItemText>
							<b>Actor</b>
						</ListItemText>
					</MenuItem>
					<MenuItem
						selected={selectedIndex === mentions.length + 1}
						onClick={() => selectEntity(editor, mentions.length + 1)}
						sx={{ borderRadius: 1 }}
					>
						<ListItemIcon>
							<Event />
						</ListItemIcon>
						<ListItemText>
							<b>Event</b>
						</ListItemText>
					</MenuItem>
					<MenuItem
						selected={selectedIndex === mentions.length + 2}
						onClick={() => selectEntity(editor, mentions.length + 2)}
						sx={{ borderRadius: 1 }}
					>
						<ListItemIcon>
							<Article />
						</ListItemIcon>
						<ListItemText>
							<b>Article</b>
						</ListItemText>
					</MenuItem>
					<MenuItem
						selected={selectedIndex === mentions.length + 3}
						onClick={() => selectEntity(editor, mentions.length + 3)}
						sx={{ borderRadius: 1 }}
					>
						<ListItemIcon>
							<LabelIcon />
						</ListItemIcon>
						<ListItemText>
							<b>Tag</b>
						</ListItemText>
					</MenuItem>
				</>
			)}
		</Paper>
	)
}
