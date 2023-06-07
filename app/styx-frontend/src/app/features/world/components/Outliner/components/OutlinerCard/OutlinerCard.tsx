import { CardActionArea, CardContent, Typography } from '@mui/material'
import styled from 'styled-components'

import { useWorldRouter } from '../../../../router'
import { WorldStatement } from '../../../../types'

type Props = {
	card: WorldStatement
	index: number
}

const CardWrapper = styled.div<{ zebra: boolean }>`
	background: ${(props) => (props.zebra ? 'rgba(255, 255, 255, 0.03)' : 'none')};
`

export const OutlinerCard = ({ card, index }: Props) => {
	const { navigateToStatementEditor } = useWorldRouter()

	const onClick = () => {
		navigateToStatementEditor(card.id)
	}

	return (
		<CardWrapper zebra={index % 2 === 0}>
			<CardActionArea onClick={onClick}>
				<CardContent style={{ padding: '8px 16px' }}>
					<Typography data-hj-suppress>{card.content}</Typography>
				</CardContent>
			</CardActionArea>
		</CardWrapper>
	)
}
