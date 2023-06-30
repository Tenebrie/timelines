import { ArrowRightAlt, Edit, Link } from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import cx from 'classnames'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { preferencesSlice } from '../../../../preferences/reducer'
import { useEventIcons } from '../../../hooks/useEventIcons'
import { useWorldRouter } from '../../../router'
import { Actor, WorldEvent } from '../../../types'
import {
	StatementActorsText,
	StyledListItemButton,
	StyledListItemText,
	ZebraWrapper,
} from '../../Outliner/styles'
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
	active: boolean
}

export const EventRenderer = ({
	event,
	highlighted,
	collapsed,
	owningActor,
	short,
	index,
	active,
}: Props) => {
	const { navigateToEventEditor } = useWorldRouter()
	const { getIconPath } = useEventIcons()
	const maxActorsDisplayed = short ? 2 : 5
	const actorsToString = useActorsToString()
	const targetActors = actorsToString(event.targetActors, owningActor, maxActorsDisplayed)
	const mentionedActors = actorsToString(event.mentionedActors, owningActor, maxActorsDisplayed)

	const dispatch = useDispatch()
	const { collapseEventInOutliner, uncollapseEventInOutliner } = preferencesSlice.actions

	const onToggleOpen = useCallback(() => {
		if (owningActor) {
			return
		}
		if (collapsed) {
			dispatch(uncollapseEventInOutliner(event))
		} else {
			dispatch(collapseEventInOutliner(event))
		}
	}, [collapseEventInOutliner, collapsed, dispatch, event, owningActor, uncollapseEventInOutliner])

	const secondaryAction =
		owningActor === null
			? [
					<IconButton key={'edit'} onClick={() => navigateToEventEditor(event.id)}>
						<Edit />
					</IconButton>,
					<IconButton key={'collapse'} sx={{ marginRight: 2 }} onClick={onToggleOpen}>
						<ShowHideChevron className={cx({ collapsed })} />
					</IconButton>,
			  ]
			: []

	return (
		<ZebraWrapper zebra={owningActor !== null && index % 2 === 0}>
			<ListItem disableGutters disablePadding secondaryAction={secondaryAction}>
				<StyledListItemButton onClick={onToggleOpen}>
					<ListItemIcon>
						<img src={getIconPath(event.icon)} height="24px" alt={`${event.icon} icon`} />
					</ListItemIcon>
					<StyledListItemText
						sx={{
							paddingRight: 6,
						}}
						data-hj-suppress
						primary={<ShortText inactive={!active}>{event.name}</ShortText>}
						secondary={
							<StatementActorsText>
								{targetActors.length > 0 ? <Link fontSize="small" /> : ''} {targetActors}
								{mentionedActors.length > 0 ? <ArrowRightAlt fontSize="small" /> : ''} {mentionedActors}
							</StatementActorsText>
						}
					/>
				</StyledListItemButton>
			</ListItem>
		</ZebraWrapper>
	)
}
