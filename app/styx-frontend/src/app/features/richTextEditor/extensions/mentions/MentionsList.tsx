import Article from '@mui/icons-material/Article'
import Event from '@mui/icons-material/Event'
import Person from '@mui/icons-material/Person'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { MentionedEntity } from '@/app/features/worldTimeline/types'
import { useCreateArticle } from '@/app/features/worldWiki/api/useCreateArticle'

import { useQuickCreateActor } from './api/useQuickCreateActor'
import { useQuickCreateEvent } from './api/useQuickCreateEvent'
import { MentionNodeName } from './components/MentionNode'
import { useDisplayedMentions } from './hooks/useDisplayedMentions'

type Props = {
	editor: Editor | null
}

export const MentionsList = ({ editor }: Props) => {
	const [visible, setVisible] = useState(false)
	const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
	const [query, setQuery] = useState('')
	const [selectedIndex, setSelectedIndex] = useState(0)

	const { mentions } = useDisplayedMentions({ query })

	const createActor = useQuickCreateActor()
	const createEvent = useQuickCreateEvent()
	const [createArticle] = useCreateArticle()

	const quickCreateVisible = query.length > 0
	const lastItemIndex = quickCreateVisible ? mentions.length + 2 : mentions.length - 1

	useEventBusSubscribe({
		event: 'richEditor/openMentions',
		callback: ({ query, screenPosTop, screenPosLeft }) => {
			if (!editor) {
				return
			}
			setVisible(true)
			setQuery(query)
			setPos({
				top: screenPosTop,
				left: screenPosLeft,
			})
		},
	})
	useEventBusSubscribe({
		event: 'richEditor/updateMentions',
		callback: ({ query }) => {
			setQuery(query)
		},
	})
	useEventBusSubscribe({
		event: 'richEditor/closeMentions',
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
		}

		if (!selectedMention && !createdEntityId) {
			return
		}

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
					componentProps: {
						actor: entityType === 'Actor' && (createdEntityId ?? selectedMention.id),
						event: entityType === 'Event' && (createdEntityId ?? selectedMention.id),
						article: entityType === 'Article' && (createdEntityId ?? selectedMention.id),
					},
				},
			})
			.run()
	}

	useEventBusSubscribe({
		event: 'richEditor/keyDown',
		callback: async ({ key, shiftKey }) => {
			if (key === 'ArrowUp' || (key === 'Tab' && shiftKey)) {
				setSelectedIndex((prev) => Math.max(prev - 1, 0))
			} else if (key === 'ArrowDown' || key === 'Tab') {
				setSelectedIndex((prev) => {
					return Math.min(prev + 1, mentions.length - (query.length > 0 ? -2 : 1))
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
	}, [mentions])

	return (
		<Paper
			sx={{
				zIndex: 10,
				position: 'absolute',
				top: `calc(${pos.top}px + 1.5rem)`,
				left: pos.left,
				visibility: visible ? 'visible' : 'hidden',
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
						onClick={() => selectEntity(editor, mentions.length)}
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
						onClick={() => selectEntity(editor, mentions.length)}
						sx={{ borderRadius: 1 }}
					>
						<ListItemIcon>
							<Article />
						</ListItemIcon>
						<ListItemText>
							<b>Article</b>
						</ListItemText>
					</MenuItem>
				</>
			)}
		</Paper>
	)
}
