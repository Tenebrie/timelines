import { Typography } from '@mui/material'
import styled from 'styled-components'

export const Container = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
	color: #2c5582;
	gap: 32px;

	opacity: 0;
	transition: opacity 0.3s;
	&.visible {
		opacity: 1;
	}
`

export const Label = styled(Typography)`
	min-width: 100px;
	display: flex;
	align-items: center;
	justify-content: center;
	word-break: none;
`
