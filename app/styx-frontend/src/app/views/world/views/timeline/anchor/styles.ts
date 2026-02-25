import styled from 'styled-components'

import { CustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

export const TimelineSmallestPips = styled.div<{ $lineSpacing: number }>`
	position: absolute;
	left: 5000px;
	bottom: 32px;
	width: 10000px;
	height: 10px;
	background-image: linear-gradient(to right, gray 1px, transparent 1px);
	background-size: ${(props) => props.$lineSpacing}px 100%;
	transition: opacity 0.3s;
`

export const DividerContainer = styled.div.attrs<{ offset: number }>((props) => ({
	style: {
		transform: `translateX(${props.offset}px)`,
	},
}))<{ offset: number }>`
	position: absolute;
	bottom: 0;
	pointer-events: none;
`

export const DividerLabel = styled.div<{ $theme: CustomTheme }>`
	transform: translateX(-50%);
	position: absolute;
	z-index: 100;
	top: 0px;
	height: 28px;
	/* background: ${(props) => props.$theme.custom.palette.background.timelineHeader}; */
	display: flex;
	align-items: center;
	justify-content: center;
	white-space: pre;
	padding: 2px 4px;
	border-radius: 4px;
	color: ${(props) => props.$theme.custom.palette.timelineAnchor.text};
`
