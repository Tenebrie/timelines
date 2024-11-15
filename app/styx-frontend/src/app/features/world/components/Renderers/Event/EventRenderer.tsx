import { Edit } from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import cx from 'classnames'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { preferencesSlice } from '@/app/features/preferences/reducer'
import { Actor, WorldEvent } from '@/app/features/world/types'
import { useWorldRouter } from '@/router/routes/worldRoutes'

import { StyledListItemButton } from '../../Outliner/styles'
import { ShowHideChevron } from '../styles'
import { EventHeaderRenderer } from './EventHeaderRenderer'

type Props = {
	event: WorldEvent
	collapsed: boolean
	owningActor: Actor | null
	short: boolean
	active: boolean
	actions: ('edit' | 'collapse')[]
}

export const EventRenderer = ({ event, collapsed, owningActor, short, active, actions }: Props) => {
	const { navigateToEventEditor } = useWorldRouter()
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
					<IconButton key={'edit'} onClick={() => navigateToEventEditor(event.id)}>
						<Edit />
					</IconButton>
				)
			case 'collapse':
				return (
					<IconButton key={'collapse'} sx={{ marginRight: 2 }} onClick={onToggleOpen}>
						<ShowHideChevron className={cx({ collapsed })} />
					</IconButton>
				)
		}
		return ''
	})

	return (
		<ListItem disableGutters disablePadding secondaryAction={secondaryAction}>
			<StyledListItemButton onClick={onToggleOpen}>
				<EventHeaderRenderer event={event} owningActor={owningActor} short={short} active={active} />
			</StyledListItemButton>
		</ListItem>
	)
}
