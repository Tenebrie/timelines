import { CardActionArea, CardContent, Typography } from '@mui/material'
import styled from 'styled-components'

import { useWorldRouter } from '../../../../router'
import { WorldStatement } from '../../../../types'

type Props = { card: WorldStatement }

const CardWrapper = styled.div`
	margin: 0;
`

export const OutlinerCard = ({ card }: Props) => {
	const { navigateToStatementEditor } = useWorldRouter()

	const onClick = () => {
		navigateToStatementEditor(card.id)
	}

	return (
		<CardWrapper>
			<CardActionArea onClick={onClick}>
				<CardContent style={{ padding: '8px 16px' }}>
					<Typography data-hj-suppress>{card.text}</Typography>
				</CardContent>
			</CardActionArea>
		</CardWrapper>
	)
}
