import { ArrowRightAlt, Edit, Link } from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import cx from 'classnames'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { preferencesSlice } from '../../../../preferences/reducer'
import { useWorldTime } from '../../../../time/hooks/useWorldTime'
import { useEventIcons } from '../../../hooks/useEventIcons'
import { useWorldRouter } from '../../../router'
import { Actor, WorldEvent } from '../../../types'
import { StatementActorsText, StyledListItemButton, StyledListItemText } from '../../Outliner/styles'
import { ShowHideChevron } from '../styles'
import { ShortText } from './styles'
import { useActorsToString } from './useActorsToString'

type Props = {
	event: WorldEvent
	highlighted: boolean
	collapsed: boolean
	owningActor: Actor | null
	short: boolean
	index: number
}

export const EventRenderer = ({ event, highlighted, collapsed, owningActor, short }: Props) => {
	const { navigateToEventEditor } = useWorldRouter()
	const { getIconPath } = useEventIcons()
	const { timeToLabel } = useWorldTime()

	const secondary = timeToLabel(event.timestamp)

	const maxActorsDisplayed = short ? 2 : 5
	const actorsToString = useActorsToString()
	const targetActors = actorsToString(event.targetActors, owningActor, maxActorsDisplayed)
	const mentionedActors = actorsToString(event.mentionedActors, owningActor, maxActorsDisplayed)

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
				<StyledListItemText
					sx={{
						paddingRight: 6,
					}}
					data-hj-suppress
					primary={<ShortText>{event.name}</ShortText>}
					secondary={[
						<>
							{
								<StatementActorsText>
									{targetActors.length > 0 ? <Link fontSize="small" /> : ''} {targetActors}
									{mentionedActors.length > 0 ? <ArrowRightAlt fontSize="small" /> : ''} {mentionedActors}
								</StatementActorsText>
							}
						</>,
					]}
				/>
			</StyledListItemButton>
		</ListItem>
	)
}
