import styled from 'styled-components'

import { CustomTheme } from '@/app/hooks/useCustomTheme'

export const TimelineWrapper = styled.div`
	width: 100%;
	height: calc(100% - 78px);
	// padding-bottom: 32px;
`

export const TimelineContainer = styled.div.attrs<{ $height: number }>((props) => ({
	style: {
		// height: props.$height + 'px',
	},
}))<{ $theme: CustomTheme }>`
	position: relative;
	width: 100%;
	height: calc(100%);
	user-select: none;
	overflow-x: clip;
	border-bottom: 1px solid ${(props) => props.$theme.material.palette.divider};
`
