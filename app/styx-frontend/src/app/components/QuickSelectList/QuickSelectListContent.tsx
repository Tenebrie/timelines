import Divider from '@mui/material/Divider'
import Input from '@mui/material/Input'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { MentionedEntity } from '@/api/types/worldTypes'
import { dispatchGlobalEvent, useEventBusSubscribe } from '@/app/features/eventBus'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

import {
	Mention,
	useDisplayedMentions,
} from '../../features/richTextEditor/extensions/mentions/hooks/useDisplayedMentions'
import { QuickSelectListProps } from './QuickSelectList'
import { getQuickCreateTypes, QuickSelectListCreate } from './QuickSelectListCreate'
import { QuickSelectListItem } from './QuickSelectListItem'
import { QuickSelectListSectionHeader } from './QuickSelectListSectionHeader'
import { QuickSelectListWelcomeState } from './QuickSelectListWelcomeState'
import { QuickSelectRect } from './types'

type ContentProps = Omit<QuickSelectListProps, 'isFocused'> & {
	pos: QuickSelectRect
	query: string
}

export function QuickSelectListContent({
	pos,
	query,
	onSelect,
	inputProps,
	forceDirection,
	onCreatePlainNode,
}: ContentProps) {
	const [selectedIndex, setSelectedIndex] = useState(0)

	const { mentions, actorCount, eventCount, articleCount, tagCount } = useDisplayedMentions({ query })

	const quickCreateVisible = query.trim().length > 0

	const lastItemIndex = quickCreateVisible
		? mentions.length + getQuickCreateTypes(!!onCreatePlainNode).length - 1
		: mentions.length - 1

	const welcomeVisible = !!inputProps && !quickCreateVisible && mentions.length === 0

	const selectEntity = useCallback(
		(mention: Mention) => {
			onSelect({
				query,
				entity: {
					id: mention.id,
					type: mention.type,
					name: mention.name,
				},
			})
		},
		[onSelect, query],
	)

	const handleKeyPress = useCallback(
		(key: string, shiftKey: boolean) => {
			if (key === 'ArrowUp' || (key === 'Tab' && shiftKey)) {
				setSelectedIndex((prev) => {
					return prev > 0 ? prev - 1 : lastItemIndex
				})
			} else if (key === 'ArrowDown' || key === 'Tab') {
				setSelectedIndex((prev) => {
					const targetIndex = prev + 1 > lastItemIndex ? 0 : prev + 1
					return targetIndex
				})
			} else if (key === 'PageUp') {
				setSelectedIndex(0)
			} else if (key === 'PageDown') {
				setSelectedIndex(lastItemIndex)
			}
		},
		[lastItemIndex],
	)

	useEventBusSubscribe['quickSelect/onKeyDown']({
		callback: ({ key, shiftKey }) => {
			handleKeyPress(key, shiftKey)
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

	const mentionTypes = useMemo(() => {
		let indexStart = 0
		return [
			{
				label: 'Actors',
				type: 'Actor' satisfies MentionedEntity,
				totalCount: actorCount,
			},
			{
				label: 'Events',
				type: 'Event' satisfies MentionedEntity,
				totalCount: eventCount,
			},
			{
				label: 'Articles',
				type: 'Article' satisfies MentionedEntity,
				totalCount: articleCount,
			},
			{
				label: 'Tags',
				type: 'Tag' satisfies MentionedEntity,
				totalCount: tagCount,
			},
		].map(({ label, type, totalCount }) => {
			const typeMentions = mentions.filter((m) => m.type === type)
			const section = { label, mentions: typeMentions, indexStart, totalCount }
			indexStart += typeMentions.length
			return section
		})
	}, [mentions, actorCount, eventCount, articleCount, tagCount])
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
						onKeyDown={(event) => {
							const NavigationKeys = ['ArrowUp', 'ArrowDown', 'Tab', 'PageUp', 'PageDown']
							if (!NavigationKeys.includes(event.key)) {
								return
							}
							event.preventDefault()
							handleKeyPress(event.key, event.shiftKey)
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
								onClick={() => selectEntity(mention)}
							/>
						))}
					</Stack>
				))}
			{quickCreateVisible && (
				<QuickSelectListCreate
					query={query}
					onCreatePlainNode={onCreatePlainNode}
					onSelect={onSelect}
					mentionCount={mentions.length}
					selectedIndex={selectedIndex}
				/>
			)}
		</Paper>
	)
}
