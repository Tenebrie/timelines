import { Actor, WorldEvent } from '@api/types/worldTypes'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import MenuIcon from '@mui/icons-material/Menu'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { ShowHideChevron } from '@/app/components/ShowHideChevron'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { StyledListItemButton } from '@/app/views/world/views/timeline/shelf/styles'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'
import { PopoverButton } from '@/ui-lib/components/PopoverButton/PopoverButton'

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
	const navigate = useStableNavigate({ from: '/world/$worldId' })
	const { open: openDeleteEventModal } = useModal('deleteEventModal')

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
					<PopoverButton
						icon={<MenuIcon />}
						aria-label="Menu"
						size="small"
						tooltip="Show actions"
						popoverAction={() => null}
						popoverBody={({ close }) => (
							<MenuList>
								<MenuItem
									onClick={() => {
										navigate({
											to: '/world/$worldId/timeline',
											search: (prev) => ({ ...prev, navi: [`issuedAt-${event.id}`] }),
										})
										close()
									}}
								>
									<ListItemIcon>
										<EditIcon />
									</ListItemIcon>
									<ListItemText>Edit</ListItemText>
								</MenuItem>
								<MenuItem
									onClick={() => {
										openDeleteEventModal({ target: event })
										close()
									}}
								>
									<ListItemIcon>
										<DeleteIcon />
									</ListItemIcon>
									<ListItemText>Delete</ListItemText>
								</MenuItem>
							</MenuList>
						)}
					/>
				)
			case 'collapse':
				return (
					<IconButton
						key={'collapse'}
						sx={{ marginRight: 2 }}
						onClick={onToggleOpen}
						aria-label="Expand or collapse"
					>
						<ShowHideChevron collapsed={collapsed} />
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
