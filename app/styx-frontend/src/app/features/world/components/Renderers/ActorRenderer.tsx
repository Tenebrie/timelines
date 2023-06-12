import { Edit } from '@mui/icons-material'
import { IconButton, ListItem, ListItemIcon } from '@mui/material'
import cx from 'classnames'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { preferencesSlice } from '../../../preferences/reducer'
import { useWorldRouter } from '../../router'
import { ActorDetails } from '../../types'
import { StyledListItemButton, StyledListItemText } from '../Outliner/styles'
import { ActorAvatar } from './ActorAvatar/ActorAvatar'
import { ShowHideChevron } from './styles'

type Props = {
	actor: ActorDetails & { highlighted: boolean }
	collapsed: boolean
}

export const ActorRenderer = ({ actor, collapsed }: Props) => {
	const { navigateToActorEditor } = useWorldRouter()

	const dispatch = useDispatch()
	const { collapseActorInOutliner, uncollapseActorInOutliner } = preferencesSlice.actions

	const onToggleOpen = useCallback(() => {
		if (collapsed) {
			dispatch(uncollapseActorInOutliner(actor))
		} else {
			dispatch(collapseActorInOutliner(actor))
		}
	}, [actor, collapseActorInOutliner, collapsed, dispatch, uncollapseActorInOutliner])

	return (
		<ListItem
			disableGutters
			disablePadding
			secondaryAction={[
				<IconButton key={'edit'} onClick={() => navigateToActorEditor(actor.id)}>
					<Edit />
				</IconButton>,
				<IconButton key={'collapse'} sx={{ marginRight: 2 }} onClick={onToggleOpen}>
					<ShowHideChevron className={cx({ collapsed })} />
				</IconButton>,
			]}
		>
			<StyledListItemButton selected={actor.highlighted} onClick={onToggleOpen}>
				<ListItemIcon>
					<ActorAvatar actor={actor} />
				</ListItemIcon>
				<StyledListItemText data-hj-suppress primary={actor.name} secondary={actor.title} />
			</StyledListItemButton>
		</ListItem>
	)
}
