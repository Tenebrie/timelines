import { Edit } from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import cx from 'classnames'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { preferencesSlice } from '../../../preferences/reducer'
import { useEventIcons } from '../../hooks/useEventIcons'
import { useWorldRouter } from '../../router'
import { WorldEvent } from '../../types'
import { StyledListItemButton, StyledListItemText } from '../Outliner/styles'
import { ShowHideChevron } from './styles'

type Props = {
	event: WorldEvent
	secondary: string
	highlighted: boolean
	collapsed: boolean
}

export const EventRenderer = ({ event, secondary, highlighted, collapsed }: Props) => {
	const { navigateToEventEditor } = useWorldRouter()
	const { getIconPath } = useEventIcons()

	const dispatch = useDispatch()
	const { collapseEventInOutliner, uncollapseEventInOutliner } = preferencesSlice.actions

	const onToggleOpen = useCallback(() => {
		if (collapsed) {
			dispatch(uncollapseEventInOutliner(event))
		} else {
			dispatch(collapseEventInOutliner(event))
		}
	}, [collapseEventInOutliner, collapsed, dispatch, event, uncollapseEventInOutliner])

	return (
		<ListItem
			disableGutters
			disablePadding
			secondaryAction={[
				<IconButton key={'edit'} onClick={() => navigateToEventEditor(event.id)}>
					<Edit />
				</IconButton>,
				<IconButton key={'collapse'} sx={{ marginRight: 2 }} onClick={onToggleOpen}>
					<ShowHideChevron className={cx({ collapsed })} />
				</IconButton>,
			]}
		>
			<StyledListItemButton selected={highlighted} onClick={onToggleOpen}>
				<ListItemIcon>
					<img src={getIconPath(event.icon)} height="24px" alt={`${event.icon} icon`} />
				</ListItemIcon>
				<StyledListItemText data-hj-suppress primary={event.name} secondary={secondary} />
			</StyledListItemButton>
		</ListItem>
	)
}
