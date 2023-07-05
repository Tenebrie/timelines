import { ArrowRightAlt, Link } from '@mui/icons-material'
import ListItemIcon from '@mui/material/ListItemIcon'

import { useEventIcons } from '../../../hooks/useEventIcons'
import { Actor, WorldEvent } from '../../../types'
import { StatementActorsText, StyledListItemText } from '../../Outliner/styles'
import { ShortText } from './styles'
import { useActorsToString } from './useActorsToString'

type Props = {
	event: WorldEvent
	owningActor: Actor | null
	short: boolean
	active: boolean
}

export const EventHeaderRenderer = ({ event, owningActor, short, active }: Props) => {
	const { getIconPath } = useEventIcons()
	const maxActorsDisplayed = short ? 2 : 5
	const actorsToString = useActorsToString()
	const targetActors = actorsToString(event.targetActors, owningActor, maxActorsDisplayed)
	const mentionedActors = actorsToString(event.mentionedActors, owningActor, maxActorsDisplayed)

	return (
		<>
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
		</>
	)
}
