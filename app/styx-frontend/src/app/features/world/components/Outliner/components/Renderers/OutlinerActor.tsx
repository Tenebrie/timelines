import { Edit } from '@mui/icons-material'
import { Avatar, IconButton, ListItem, ListItemIcon } from '@mui/material'
import { useDispatch } from 'react-redux'

import { preferencesSlice } from '../../../../../preferences/reducer'
import { useWorldRouter } from '../../../../router'
import { ActorDetails } from '../../../../types'
import { StyledListItemButton, StyledListItemText } from '../../styles'

type Props = {
	actor: ActorDetails & { highlighted: boolean }
	collapsed: boolean
}

export const OutlinerActor = ({ actor, collapsed }: Props) => {
	const { navigateToActorEditor } = useWorldRouter()

	const dispatch = useDispatch()
	const { collapseActorInOutliner, uncollapseActorInOutliner } = preferencesSlice.actions

	const color = (() => {
		if (actor.color) {
			return actor.color
		}
		return 'teal'
	})()

	const initials = (() => {
		const capitals = actor.name.replace(/[^A-Z]+/g, '')
		if (capitals.length >= 2) {
			return capitals.substring(0, 2)
		}
		return actor.name.substring(0, 2)
	})()

	const onToggleOpen = () => {
		if (collapsed) {
			dispatch(uncollapseActorInOutliner(actor))
		} else {
			dispatch(collapseActorInOutliner(actor))
		}
	}

	return (
		<ListItem
			disableGutters
			disablePadding
			secondaryAction={
				<IconButton sx={{ marginRight: 2 }} onClick={() => navigateToActorEditor(actor.id)}>
					<Edit />
				</IconButton>
			}
		>
			<StyledListItemButton selected={actor.highlighted} onClick={onToggleOpen}>
				<ListItemIcon>
					<Avatar sx={{ bgcolor: color }}>{initials}</Avatar>
				</ListItemIcon>
				<StyledListItemText data-hj-suppress primary={actor.name} secondary={actor.title} />
			</StyledListItemButton>
		</ListItem>
	)
}
