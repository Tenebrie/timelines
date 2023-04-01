import { Button, Card, CardActions, CardContent, Typography } from '@mui/material'
import { useSelector } from 'react-redux'

import { useWorldTime } from '../../../../time/hooks/useWorldTime'
import { getWorldState } from '../../../selectors'
import { WorldStatement } from '../../../types'

type Props = { card: WorldStatement } & (
	| {
			mode: 'editor'
			onDelete: () => void
	  }
	| {
			mode: 'outliner'
			onDelete?: () => void
	  }
)

export const IssuedStatementCard = ({ card, mode, onDelete }: Props) => {
	const { timeToLabel } = useWorldTime()
	const { events } = useSelector(getWorldState)
	const parentEvent = events.find((event) =>
		event.issuedStatements.find((statement) => statement.id === card.id)
	)
	const timeLabel = timeToLabel(parentEvent?.timestamp || 0)

	return (
		<Card>
			<CardContent>
				<Typography variant="h5">{card.title}</Typography>
				{mode === 'outliner' && (
					<Typography>
						[{timeLabel}]: {parentEvent?.name}
					</Typography>
				)}
				<br />
				<Typography>{card.text}</Typography>
			</CardContent>
			<CardActions>{mode === 'editor' && <Button onClick={onDelete}>Delete</Button>}</CardActions>
		</Card>
	)
}
