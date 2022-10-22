import { Button, Card, CardActions, CardContent, Typography } from '@mui/material'
import { useSelector } from 'react-redux'

import { getWorldState } from '../../../selectors'

type Props = {
	id: string
	onDelete?: () => void
}

export const RevokedStatementCard = ({ id, onDelete }: Props) => {
	const { events } = useSelector(getWorldState)

	const matchingCard = events.flatMap((event) => event.issuedWorldStatements).find((card) => card.id === id)

	return (
		<Card>
			<CardContent>
				<Typography variant="h5">{matchingCard?.name || 'Not found'}</Typography>
				<Typography>{matchingCard?.text || 'Not found'}</Typography>
			</CardContent>
			<CardActions>{onDelete && <Button onClick={onDelete}>Delete</Button>}</CardActions>
		</Card>
	)
}
