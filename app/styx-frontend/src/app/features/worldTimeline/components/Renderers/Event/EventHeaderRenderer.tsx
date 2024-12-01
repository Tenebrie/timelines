import { ArrowRightAlt, Link } from '@mui/icons-material'
import { useTheme } from '@mui/material'
import ListItemIcon from '@mui/material/ListItemIcon'

import { EventIcon } from '@/app/components/EventIcon'
import { Actor, WorldEvent } from '@/app/features/worldTimeline/types'

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
	const maxActorsDisplayed = short ? 2 : 5
	const actorsToString = useActorsToString()
	const targetActors = actorsToString(event.targetActors, owningActor, maxActorsDisplayed)
	const mentionedActors = actorsToString(event.mentionedActors, owningActor, maxActorsDisplayed)
	const theme = useTheme()

	return (
		<>
			<ListItemIcon>
				<EventIcon name={event.icon} height={24} />
			</ListItemIcon>
			<StyledListItemText
				sx={{
					paddingRight: 6,
				}}
				data-hj-suppress
				primary={
					<ShortText
						$inactive={!active}
						style={{ fontWeight: theme.typography.fontWeightBold, color: theme.palette.secondary.main }}
					>
						{event.name}
					</ShortText>
				}
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
