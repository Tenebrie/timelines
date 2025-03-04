import styled from 'styled-components'

import { CustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

export const Container = styled.div<{ $theme: CustomTheme }>`
	background: ${(props) => props.$theme.material.palette.primary.main};
	width: 3px;
	margin-left: -1px;
	height: calc(100% - 32px);
	opacity: 1;
	transition: opacity 0.3s;
	pointer-events: none;
	border-radius: 3px;

	&.hidden {
		opacity: 0;
	}
`
