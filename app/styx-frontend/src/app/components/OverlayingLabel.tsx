import { Typography } from '@mui/material'
import { ReactNode } from 'react'
import styled from 'styled-components'

export const Container = styled.div`
	transform-origin: top left;
	position: absolute;
	top: -1px;
	left: -5px;
	transform: translate(14px, -9px) scale(0.75);
	background: #0a1929;
	padding: 0 6px;
	z-index: 1;
	border-radius: 6px;
`

type Props = {
	children: ReactNode | ReactNode[]
}

export const OverlayingLabel = ({ children }: Props) => {
	return (
		<Container>
			<Typography variant="body1">{children}</Typography>
		</Container>
	)
}
