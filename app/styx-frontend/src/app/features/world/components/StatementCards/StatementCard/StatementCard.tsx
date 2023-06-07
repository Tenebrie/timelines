import { Card, CardActionArea, CardContent, Typography } from '@mui/material'

import { useWorldRouter } from '../../../router'
import { WorldStatement } from '../../../types'

type Props = { card: WorldStatement }

export const StatementCard = ({ card }: Props) => {
	const { navigateToStatementEditor } = useWorldRouter()

	const onClick = () => {
		navigateToStatementEditor(card.id)
	}

	return (
		<Card>
			<CardActionArea onClick={onClick}>
				<CardContent data-hj-suppress>
					<Typography variant="h6" noWrap={true}>
						{card.title}
					</Typography>
					<br />
					<Typography>{card.content}</Typography>
				</CardContent>
			</CardActionArea>
		</Card>
	)
}
