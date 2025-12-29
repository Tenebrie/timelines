import { ActorDetails } from '@api/types/worldTypes'
import Edit from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { ActorAvatar } from '@/app/components/ActorAvatar/ActorAvatar'
import { ShowHideChevron } from '@/app/components/ShowHideChevron'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { useIsReadOnly } from '@/app/views/world/hooks/useIsReadOnly'
import { StyledListItemButton, StyledListItemText } from '@/app/views/world/views/timeline/shelf/styles'

type Props = {
	actor: ActorDetails
	collapsed: boolean
}

export const ActorRenderer = ({ actor, collapsed }: Props) => {
	const navigate = useNavigate({ from: '/world/$worldId' })

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
			<IconButton
				key={'edit'}
				onClick={() => {
					navigate({
						to: '/world/$worldId/mindmap',
						search: (prev) => ({ ...prev, selection: [actor.id] }),
					})
					requestIdleCallback(() => {
						// openEditActorModal({ actorId: actor.id })
					})
				}}
			>
				<Edit />
			</IconButton>,
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
