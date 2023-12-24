import { useTheme } from '@mui/material'
import React, { ReactNode } from 'react'
import styled from 'styled-components'

import { OverlayingLabel } from './OverlayingLabel'

type Props = {
	label?: string
	children?: ReactNode | ReactNode[]
	style?: React.CSSProperties
}

export const OutlinedContainer = ({ label, children, style }: Props) => {
	const theme = useTheme()

	return (
		<OutlinedFieldset theme={theme} style={style}>
			{label && <OverlayingLabel>{label}</OverlayingLabel>}
			{children}
		</OutlinedFieldset>
	)
}

const OutlinedFieldset = styled.fieldset`
	display: flex;
	flex-direction: column;
	gap: 8px;
	border-radius: ${(props) => props.theme.shape.borderRadius}px;
	border: 1px solid
		${(props) => (props.theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)')};
	padding: 8px 16px;
	position: relative;
	margin-top: -8.5px;

	@media all and (min-width: 900px) {
		height: 100%;
	}
`
