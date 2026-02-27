import { ActorDetails } from '@api/types/worldTypes'
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

import { ActorAvatar } from '@/app/components/ActorAvatar/ActorAvatar'
import { ShowHideChevron } from '@/app/components/ShowHideChevron'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { useIsReadOnly } from '@/app/views/world/hooks/useIsReadOnly'
import { StyledListItemButton, StyledListItemText } from '@/app/views/world/views/timeline/shelf/styles'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'
import { PopoverButton } from '@/ui-lib/components/PopoverButton/PopoverButton'

type Props = {
	actor: ActorDetails
	collapsed: boolean
}

export const ActorHeaderRenderer = ({ actor, collapsed }: Props) => {
	const navigate = useStableNavigate({ from: '/world/$worldId' })
	const { open: openDeleteActorModal } = useModal('deleteActorModal')

	const { isReadOnly } = useIsReadOnly()
	const dispatch = useDispatch()
	const { collapseActorInOutliner, uncollapseActorInOutliner } = preferencesSlice.actions

	const onToggleOpen = useCallback(() => {
		if (collapsed) {
			dispatch(uncollapseActorInOutliner(actor))
		} else {
			dispatch(collapseActorInOutliner(actor))
		}
	}, [actor, collapseActorInOutliner, collapsed, dispatch, uncollapseActorInOutliner])

	const actions = [
		<IconButton key={'collapse'} sx={{ marginRight: 2 }} onClick={onToggleOpen}>
			<ShowHideChevron collapsed={collapsed} />
		</IconButton>,
	]
	if (!isReadOnly) {
		actions.push(
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
									to: '/world/$worldId/mindmap',
									search: (prev) => ({ ...prev, navi: [actor.id] }),
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
								openDeleteActorModal({ target: actor })
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
			/>,
		)
		actions.reverse()
	}

	return (
		<ListItem disableGutters disablePadding secondaryAction={actions}>
			<StyledListItemButton onClick={onToggleOpen}>
				<ListItemIcon>
					<ActorAvatar actor={actor} />
				</ListItemIcon>
				<StyledListItemText data-hj-suppress primary={actor.name} secondary={actor.title} />
			</StyledListItemButton>
		</ListItem>
	)
}
