import styled from 'styled-components'

import { CustomTheme } from '../../../../../../../hooks/useCustomTheme'

export const Container = styled.div.attrs<{ $offset: number }>((props) => ({
	style: {
		transform: `translateX(${props.$offset}px)`,
	},
}))<{ $offset: number; $theme: CustomTheme }>`
	top: 0;
	position: absolute;
	background: ${(props) => props.$theme.material.palette.primary.main};
	width: 2px;
	margin-left: -1px;
	height: 100%;
	opacity: 1;
	transition: opacity 0.3s;
	pointer-events: none;
	border-radius: 3px;

	&.hidden {
		opacity: 0;
	}
`
