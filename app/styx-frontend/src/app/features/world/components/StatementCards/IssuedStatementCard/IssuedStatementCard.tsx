import { Button, Card, CardActions, CardContent, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'

import { worldSlice } from '../../../reducer'
import { WorldStatement } from '../../../types'

type Props = { card: WorldStatement }

export const IssuedStatementCard = ({ card }: Props) => {
	const dispatch = useDispatch()
	const { openDeleteStatementModal } = worldSlice.actions

	const onDelete = () => dispatch(openDeleteStatementModal(card))

	return (
		<Card>
			<CardContent>
				<Typography variant="h6">{card.title}</Typography>
				<br />
				<Typography>{card.text}</Typography>
			</CardContent>
			<CardActions>
				<Button onClick={onDelete}>Delete</Button>
			</CardActions>
		</Card>
	)
}
