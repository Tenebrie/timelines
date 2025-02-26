import styled from 'styled-components'

import { CustomTheme } from '@/app/features/theming/useCustomTheme'

export const TimelineSmallestPips = styled.div<{ $lineSpacing: number }>`
	position: absolute;
	left: 0;
	bottom: 0;
	width: 120vw;
	height: 10px;
	background-image: linear-gradient(to right, gray 1px, transparent 1px);
	background-size: ${(props) => props.$lineSpacing}px 100%;
	transform: translateX(var(--pip-scroll));
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
	top: 3px;
	left: -50%;
	background: ${(props) => props.$theme.custom.palette.background.timelineHeader};
	display: flex;
	align-items: center;
	justify-content: center;
	white-space: pre;
	padding: 2px 16px;
	border-radius: 8px;
	color: ${(props) => props.$theme.custom.palette.timelineAnchor.text};
`
