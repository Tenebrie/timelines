import { Actor, WorldEvent } from '@api/types/types'
import Link from '@mui/icons-material/Link'
import { useTheme } from '@mui/material'
import ListItemIcon from '@mui/material/ListItemIcon'

import { EventIcon } from '@/app/features/icons/components/EventIcon'
import { StatementActorsText, StyledListItemText } from '@/app/views/world/views/timeline/shelf/styles'

import { ShortText } from './styles'
import { useMentionsToString } from './useMentionsToString'

type Props = {
	event: WorldEvent
	owningActor: Actor | null
	short: boolean
	active: boolean
}

export const EventHeaderRenderer = ({ event, owningActor, short, active }: Props) => {
	const maxActorsDisplayed = short ? 2 : 5
	const mentionsToString = useMentionsToString()
	const mentionedActors = mentionsToString(event.mentions, owningActor, maxActorsDisplayed)
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
						{mentionedActors.length > 0 ? <Link fontSize="small" /> : ''} {mentionedActors}
					</StatementActorsText>
				}
			/>
		</>
	)
}
