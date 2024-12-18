import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'
import styled from 'styled-components'

export const Container = styled.legend`
	padding: 0 6px;
`

type Props = {
	children: ReactNode | ReactNode[]
}

export const OverlayingLabel = ({ children }: Props) => {
	return (
		<Container>
			<Typography variant="body1" fontSize={12} fontWeight="500">
				{children}
			</Typography>
		</Container>
	)
}
