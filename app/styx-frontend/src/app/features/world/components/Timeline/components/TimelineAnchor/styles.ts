import styled from 'styled-components'

import { CustomTheme } from '@/hooks/useCustomTheme'

export const TimelineAnchorContainer = styled.div.attrs<{ offset: number }>((props) => ({
	style: {
		transform: `translateX(${props.offset}px)`,
	},
}))<{ offset: number }>`
	position: absolute;
	bottom: 0;
`

export const TimelineSmallestPips = styled.div.attrs<{
	offset: number
	$visible: boolean
	$lineSpacing: number
}>((props) => ({
	style: {
		transform: `translateX(${-props.offset + (props.offset % props.$lineSpacing)}px)`,
		opacity: props.$visible ? 1 : 0,
	},
}))<{ offset: number; $lineSpacing: number }>`
	position: absolute;
	left: 0;
	bottom: 0;
	width: 120vw;
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
	opacity: 0;
	transition: opacity 0.3s;

	&.visible {
		opacity: 1;
	}
`

export const Divider = styled.div.attrs<{ color: string; height: number }>((props) => ({
	style: {
		backgroundColor: props.color,
		height: `${8 * props.height}px`,
	},
}))<{ color: string; height: number }>`
	position: absolute;
	background: gray;
	width: 1px;
	bottom: 0;
`

export const DividerLabel = styled.div<{ $theme: CustomTheme }>`
	position: absolute;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	white-space: pre;
	color: ${(props) => props.$theme.custom.palette.timelineAnchor.text};
`
