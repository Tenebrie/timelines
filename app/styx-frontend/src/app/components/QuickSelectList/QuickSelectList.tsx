import { MentionedEntity } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Input from '@mui/material/Input'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { useQuickCreateActor } from '@/api/hooks/useQuickCreateActor'
import { useQuickCreateEvent } from '@/api/hooks/useQuickCreateEvent'
import { useQuickCreateTag } from '@/api/hooks/useQuickCreateTag'
import { dispatchGlobalEvent, useEventBusSubscribe } from '@/app/features/eventBus'
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
import { QuickSelectListWelcomeState } from './QuickSelectListWelcomeState'

type Props = {
	isFocused: boolean
	onSelect: (params: { query: string; entity: { id: string; type: MentionedEntity; name: string } }) => void
	inputProps?: InputProps
	forceDirection?: 'bottom'
	onCreatePlainNode?: (name: string) => void
}

type QuickCreateOption = {
	type: 'Actor' | 'Event' | 'Article' | 'Tag' | 'Node'
	run: () => Promise<void> | void
}

type InputProps = {
	autoFocus?: boolean
	placeholder?: string
}

export type QuickSelectListProps = Props

type Position = { top: number; bottom: number; left: number }

const NAVIGATION_KEYS = ['ArrowUp', 'ArrowDown', 'Tab', 'Enter', 'PageUp', 'PageDown']

export const QuickSelectList = memo(QuickSelectListComponent)

export function QuickSelectListComponent({
	isFocused,
	onSelect,
	inputProps,
	forceDirection,
	onCreatePlainNode,
}: Props) {
	const [visible, setVisible] = useState(false)
	const [pos, setPos] = useState<Position>({ top: 0, bottom: 0, left: 0 })
	const [query, setQuery] = useState('')

	const close = useCallback(() => {
		setVisible(false)
		dispatchGlobalEvent['quickSelect/onClosed']()
	}, [])

	useShortcut(
		Shortcut.Escape,
		() => {
			close()
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
	useEventBusSubscribe['quickSelect/requestUpdateQuery']({
		callback: ({ query }) => {
			setQuery(query)
		},
	})
	useEventBusSubscribe['quickSelect/requestClose']({
		callback: () => {
			close()
		},
	})

	if (!visible || !isFocused) {
		return null
	}

	return (
		<Box
			sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100 }}
			onClick={() => {
				close()
			}}
			onContextMenu={(event) => {
				if (event.shiftKey) {
					return
				}
				event.preventDefault()
				close()
			}}
		>
			<QuickSelectListContent
				pos={pos}
				query={query}
				onSelect={onSelect}
				onClose={close}
				inputProps={inputProps}
				forceDirection={forceDirection}
				onCreatePlainNode={onCreatePlainNode}
			/>
		</Box>
	)
}

type ContentProps = {
	pos: Position
	query: string
	onSelect: (params: { query: string; entity: { id: string; type: MentionedEntity; name: string } }) => void
	onClose: () => void
	inputProps?: InputProps
	forceDirection?: 'bottom'
	onCreatePlainNode?: (name: string) => void
}

function QuickSelectListContent({
	pos,
	query,
	onSelect,
	onClose,
	inputProps,
	forceDirection,
	onCreatePlainNode,
}: ContentProps) {
	const [selectedIndex, setSelectedIndex] = useState(0)

	const { mentions, actorCount, eventCount, articleCount, tagCount } = useDisplayedMentions({ query })

	const createActor = useQuickCreateActor()
	const createEvent = useQuickCreateEvent()
	const [createArticle] = useCreateArticle()
	const createTag = useQuickCreateTag()

	const selectCreated = useCallback(
		(type: MentionedEntity, id: string | undefined) => {
			if (!id) {
				return
			}
			onSelect({ query, entity: { id, type, name: query } })
		},
		[onSelect, query],
	)

	const quickCreateVisible = query.trim().length > 0
	const quickCreateOptions = useMemo(() => {
		const options: QuickCreateOption[] = [
			{ type: 'Actor', run: async () => selectCreated('Actor', (await createActor({ query }))?.id) },
			{ type: 'Event', run: async () => selectCreated('Event', (await createEvent({ query }))?.id) },
			{
				type: 'Article',
				run: async () => selectCreated('Article', (await createArticle({ name: query }))?.id),
			},
			{ type: 'Tag', run: async () => selectCreated('Tag', (await createTag({ query }))?.id) },
		]
		if (onCreatePlainNode) {
			options.unshift({ type: 'Node', run: async () => onCreatePlainNode(query) })
		}
		return options
	}, [createActor, createArticle, createEvent, createTag, onCreatePlainNode, query, selectCreated])

	const lastItemIndex = quickCreateVisible
		? mentions.length + quickCreateOptions.length - 1
		: mentions.length - 1

	const showWelcomeState = !!inputProps
	const welcomeVisible = !!showWelcomeState && !quickCreateVisible && mentions.length === 0

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
			if (selectedMention) {
				onSelect({
					query,
					entity: {
						id: selectedMention.id,
						type: selectedMention.type,
						name: selectedMention.name,
					},
				})
				return
			}

			await quickCreateOptions[index - mentions.length]?.run()
		},
		[mentions, onSelect, query, quickCreateOptions],
	)

	const handleKeyPress = useCallback(
		async (key: string, shiftKey: boolean) => {
			if (key === 'ArrowUp' || (key === 'Tab' && shiftKey)) {
				setSelectedIndex((prev) => {
					return prev > 0 ? prev - 1 : lastItemIndex
				})
			} else if (key === 'ArrowDown' || key === 'Tab') {
				setSelectedIndex((prev) => {
					const targetIndex = prev + 1 > lastItemIndex ? 0 : prev + 1
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
		[lastItemIndex, selectEntity, selectedIndex],
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
	const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined)
	const paperRef = useRef<HTMLDivElement>(null)

	const recalculatePosition = useCallback(() => {
		const el = paperRef.current
		if (!el) {
			return
		}

		const viewportWidth = document.documentElement.clientWidth
		const viewportHeight = document.documentElement.clientHeight
		const elWidth = el.offsetWidth
		const elHeight = el.scrollHeight

		setAdjustedLeft(Math.max(0, Math.min(pos.left, viewportWidth - elWidth)))

		const spaceBelow = viewportHeight - pos.bottom
		const spaceAbove = pos.top

		if (forceDirection === 'bottom' || elHeight <= spaceBelow || spaceBelow >= spaceAbove) {
			setAdjustedTop(pos.bottom)
			setMaxHeight(spaceBelow)
		} else {
			setAdjustedTop(Math.max(0, pos.top - elHeight))
			setMaxHeight(spaceAbove)
		}
	}, [forceDirection, pos.bottom, pos.left, pos.top])

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
				maxHeight,
				overflowY: 'auto',
			}}
		>
			{inputProps && (
				<Stack gap={1} sx={{ padding: '8px 16px' }}>
					<Input
						size="small"
						value={query}
						{...inputProps}
						onChange={(event) => {
							dispatchGlobalEvent['quickSelect/requestUpdateQuery']({
								query: event.target.value,
							})
						}}
						onKeyDown={async (event) => {
							if (!NAVIGATION_KEYS.includes(event.key)) {
								return
							}
							event.preventDefault()
							await handleKeyPress(event.key, event.shiftKey)
							if (event.key === 'Enter') {
								onClose()
							}
						}}
					/>
				</Stack>
			)}
			{welcomeVisible && <QuickSelectListWelcomeState />}
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
					{quickCreateOptions.map((option, index) => (
						<QuickSelectListItemQuickCreate
							key={option.type}
							type={option.type}
							selected={selectedIndex === mentions.length + index}
							onClick={() => selectEntity(mentions.length + index)}
							query={query}
						/>
					))}
				</>
			)}
		</Paper>
	)
}
