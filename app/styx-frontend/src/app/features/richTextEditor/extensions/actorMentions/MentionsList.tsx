import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import { Editor } from '@tiptap/react'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { getWorldState } from '@/app/features/worldTimeline/selectors'
import { Actor } from '@/app/features/worldTimeline/types'

import { ActorMentionNodeName } from './components/ActorMentionNode'
import { useQuickCreateActor } from './hooks/useQuickCreateActor'

type Props = {
	editor: Editor | null
}

export const MentionsList = ({ editor }: Props) => {
	const [visible, setVisible] = useState(false)
	const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
	const [query, setQuery] = useState('')
	const [selectedIndex, setSelectedIndex] = useState(0)

	const { actors } = useSelector(getWorldState, (a, b) => a.actors === b.actors)
	const createActor = useQuickCreateActor()

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

	const selectActor = async (editor: Editor | null, index: number) => {
		if (!editor) {
			return
		}

		let actor: Actor | null = displayedMentions[index] ?? null
		if (index === displayedMentions.length) {
			actor = await createActor({ query })
		}
		if (!actor) {
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
				type: ActorMentionNodeName,
				attrs: {
					componentProps: {
						actor: actor.id,
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
					return Math.min(prev + 1, displayedMentions.length - (query.length > 0 ? 0 : 1))
				})
			} else if (key === 'Enter') {
				await selectActor(editor, selectedIndex)
			}
		},
	})

	const displayedMentions = useMemo(() => {
		if (!query) {
			return actors
		}

		return actors.filter((actor) => actor.name.toLowerCase().includes(query.toLowerCase()))
	}, [actors, query])

	return (
		<Paper
			sx={{
				zIndex: 10,
				position: 'absolute',
				top: `calc(${pos.top}px + 1.5rem)`,
				left: pos.left,
				visibility: visible ? 'visible' : 'hidden',
			}}
		>
			{displayedMentions.map((actor, index) => (
				<MenuItem
					selected={selectedIndex === index}
					key={actor.id}
					onClick={() => selectActor(editor, index)}
					sx={{ borderRadius: 1 }}
				>
					{actor.name}
				</MenuItem>
			))}
			{query.length > 0 && (
				<MenuItem
					selected={selectedIndex === displayedMentions.length}
					onClick={() => selectActor(editor, displayedMentions.length)}
					sx={{ borderRadius: 1 }}
				>
					Create actor {query.length > 0 ? `'${query}'` : `'Unnamed Actor'`}
				</MenuItem>
			)}
		</Paper>
	)
}
