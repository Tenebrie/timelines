import { ActorDetails } from '@api/types/types'
import Edit from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import { useNavigate } from '@tanstack/react-router'
import cx from 'classnames'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { ActorAvatar } from '@/app/components/ActorAvatar/ActorAvatar'
import { useEventBusDispatch } from '@/app/features/eventBus'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { useIsReadOnly } from '@/app/views/world/hooks/useIsReadOnly'
import { StyledListItemButton, StyledListItemText } from '@/app/views/world/views/timeline/shelf/styles'

import { ShowHideChevron } from './styles'

type Props = {
	actor: ActorDetails
	collapsed: boolean
}

export const ActorRenderer = ({ actor, collapsed }: Props) => {
	const navigate = useNavigate({ from: '/world/$worldId' })

	const { isReadOnly } = useIsReadOnly()
	const dispatch = useDispatch()
	const { collapseActorInOutliner, uncollapseActorInOutliner } = preferencesSlice.actions

	const openActorDrawer = useEventBusDispatch({ event: 'mindmap/actorDrawer/requestOpen' })

	const onToggleOpen = useCallback(() => {
		if (collapsed) {
			dispatch(uncollapseActorInOutliner(actor))
		} else {
			dispatch(collapseActorInOutliner(actor))
		}
	}, [actor, collapseActorInOutliner, collapsed, dispatch, uncollapseActorInOutliner])

	const actions = [
		<IconButton key={'collapse'} sx={{ marginRight: 2 }} onClick={onToggleOpen}>
			<ShowHideChevron className={cx({ collapsed })} />
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
						openActorDrawer({})
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
