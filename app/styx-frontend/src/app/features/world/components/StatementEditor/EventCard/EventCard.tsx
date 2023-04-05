import { Card, CardActionArea, CardContent, Typography } from '@mui/material'

import { TrunkatedTypography } from '../../../../../components/TrunkatedTypography'
import { useWorldTime } from '../../../../time/hooks/useWorldTime'
import { useWorldRouter } from '../../../router'
import { WorldEvent } from '../../../types'

type Props = { card: WorldEvent }

export const EventCard = ({ card }: Props) => {
	const { navigateToEventEditor } = useWorldRouter()
	const { timeToLabel } = useWorldTime()

	const onClick = () => {
		navigateToEventEditor(card.id)
	}

	const trunkatedDescription =
		card.description.length > 1024 ? card.description.substring(0, 1024) + '...' : card.description

	return (
		<Card>
			<CardActionArea onClick={onClick}>
				<CardContent>
					<Typography variant="h6" noWrap={true}>
						{card.name}
					</Typography>
					<Typography variant="caption" noWrap={true}>
						{timeToLabel(card.timestamp)}
					</Typography>
					<br />
					<br />
					<TrunkatedTypography lines={4}>{trunkatedDescription}</TrunkatedTypography>
				</CardContent>
			</CardActionArea>
		</Card>
	)
}
