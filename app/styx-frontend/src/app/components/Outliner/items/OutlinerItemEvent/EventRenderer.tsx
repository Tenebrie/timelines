import { Actor, WorldEvent } from '@api/types/types'
import Edit from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import { useNavigate } from '@tanstack/react-router'
import cx from 'classnames'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { preferencesSlice } from '@/app/features/preferences/reducer'
import { StyledListItemButton } from '@/app/views/world/views/timeline/components/TimelineShelf/styles'

import { ShowHideChevron } from '../OutlinerItemActor/styles'
import { EventHeaderRenderer } from './EventHeaderRenderer'

type Props = {
	event: WorldEvent
	collapsed: boolean
	owningActor: Actor | null
	short: boolean
	active: boolean
	actions: readonly ('edit' | 'collapse')[]
}

export const EventRenderer = ({ event, collapsed, owningActor, short, active, actions }: Props) => {
	const navigate = useNavigate({ from: '/world/$worldId' })
	const scrollTimelineTo = useEventBusDispatch({ event: 'scrollTimelineTo' })
	const openEntityDrawer = useEventBusDispatch({ event: 'timeline/openEventDrawer' })

	const dispatch = useDispatch()
	const { collapseEventInOutliner, uncollapseEventInOutliner } = preferencesSlice.actions

	const onToggleOpen = useCallback(() => {
		if (!actions.includes('collapse')) {
			return
		}
		if (collapsed) {
			dispatch(uncollapseEventInOutliner(event))
		} else {
			dispatch(collapseEventInOutliner(event))
		}
	}, [actions, collapseEventInOutliner, collapsed, dispatch, event, uncollapseEventInOutliner])

	const secondaryAction = actions.map((action) => {
		switch (action) {
			case 'edit':
				return (
					<IconButton
						key={'edit'}
						onClick={() => {
							navigate({
								to: '/world/$worldId/timeline',
								search: (prev) => ({ ...prev, selection: [`issuedAt-${event.id}`] }),
							})
							scrollTimelineTo({ timestamp: event.timestamp })
							openEntityDrawer({})
						}}
						aria-label="Edit"
					>
						<Edit />
					</IconButton>
				)
			case 'collapse':
				return (
					<IconButton
						key={'collapse'}
						sx={{ marginRight: 2 }}
						onClick={onToggleOpen}
						aria-label="Expand or collapse"
					>
						<ShowHideChevron className={cx({ collapsed })} />
					</IconButton>
				)
		}
	})

	return (
		<ListItem disableGutters disablePadding secondaryAction={secondaryAction}>
			<StyledListItemButton onClick={onToggleOpen}>
				<EventHeaderRenderer event={event} owningActor={owningActor} short={short} active={active} />
			</StyledListItemButton>
		</ListItem>
	)
}
