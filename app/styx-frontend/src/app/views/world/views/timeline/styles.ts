import styled from 'styled-components'

import { CustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

export const TimelineWrapper = styled.div`
	width: 100%;
	height: calc(100%);
	// padding-bottom: 32px;
`

export const TimelineContainer = styled.div<{ $theme: CustomTheme }>`
	position: relative;
	width: 100%;
	height: calc(100%);
	user-select: none;
	overflow-x: clip;
	transition: background-color 0.3s;
	background-color: ${(props) => props.$theme.custom.palette.background.timeline};
	border-bottom: 1px solid ${(props) => props.$theme.material.palette.divider};
`
