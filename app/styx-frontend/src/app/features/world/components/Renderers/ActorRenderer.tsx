import { Edit } from '@mui/icons-material'
import { IconButton, ListItem, ListItemIcon } from '@mui/material'
import cx from 'classnames'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { preferencesSlice } from '@/app/features/preferences/reducer'
import { useIsReadOnly } from '@/hooks/useIsReadOnly'
import { useWorldRouter } from '@/router/routes/worldRoutes'

import { ActorDetails } from '../../types'
import { StyledListItemButton, StyledListItemText } from '../Outliner/styles'
import { ActorAvatar } from './ActorAvatar/ActorAvatar'
import { ShowHideChevron } from './styles'

type Props = {
	actor: ActorDetails
	collapsed: boolean
}

export const ActorRenderer = ({ actor, collapsed }: Props) => {
	const { navigateToActorEditor } = useWorldRouter()

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
			<ShowHideChevron className={cx({ collapsed })} />
		</IconButton>,
	]
	if (!isReadOnly) {
		actions.push(
			<IconButton key={'edit'} onClick={() => navigateToActorEditor(actor.id)}>
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
