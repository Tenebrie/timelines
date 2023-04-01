import { Button, Card, CardActions, CardContent, Typography } from '@mui/material'
import { useSelector } from 'react-redux'

import { useUnrevokeWorldStatementMutation } from '../../../../../../api/rheaApi'
import { useWorldRouter } from '../../../router'
import { getWorldState } from '../../../selectors'

type Props = {
	id: string
}

export const RevokedStatementCard = ({ id }: Props) => {
	const { events } = useSelector(getWorldState)
	const { worldParams } = useWorldRouter()

	const [unrevokeWorldStatement, { isLoading }] = useUnrevokeWorldStatementMutation()

	const onDelete = () => {
		unrevokeWorldStatement({
			worldId: worldParams.worldId,
			statementId: id,
			// TODO: Figure out why this is here
			body: '',
		})
	}

	const matchingCard = events.flatMap((event) => event.issuedStatements).find((card) => card.id === id)

	return (
		<Card>
			<CardContent>
				<Typography variant="h5">{matchingCard?.title || 'Not found'}</Typography>
				<Typography>{matchingCard?.text || 'Not found'}</Typography>
			</CardContent>
			<CardActions>{onDelete && <Button onClick={onDelete}>Delete</Button>}</CardActions>
		</Card>
	)
}
