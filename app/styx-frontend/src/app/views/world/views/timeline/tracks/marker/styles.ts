import * as colors from '@mui/material/colors'
import styled from 'styled-components'

import { CustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

export type StoryEventMarkerProps = {
	groupIndex: number
	expanded: boolean
}

export const BaseMarker = styled.div<{
	$theme: CustomTheme
}>`
	position: relative;
	width: var(--marker-size);
	height: var(--marker-size);
	border-radius: var(--border-radius);
	background: ${(props) => props.$theme.custom.palette.background.timelineMarker};
	cursor: pointer;
	transition:
		margin-bottom 0.3s,
		border-color 0.3s,
		background-color 0.3s;
	border: 2px solid ${colors.grey[300]};
	border-color: var(--border-color) !important;
`

export const Marker = styled(BaseMarker)`
	&:hover > .hover-highlight {
		background: ${(props) => (props.$theme.mode === 'dark' ? '#ffffff20' : '#00000030')};
	}
	&:active > .active-highlight {
		background: ${(props) => (props.$theme.mode === 'dark' ? '#ffffff20' : '#00000030')};
	}
	&.selected > .selection-highlight {
		opacity: 0.3;
	}
`

export const MarkerIcon = styled.div`
	position: absolute;
	mask-size: cover;
	mask-position: 0px 0px;
	mask-repeat: no-repeat;
	background-origin: content-box;
	background-size: contain;
	width: calc(100%);
	height: calc(100%);
	display: flex;
	border-radius: inherit;
	align-items: center;
	justify-content: center;
	transition:
		color 0.3s,
		background-color 0.3s;
	color: var(--border-color);
	& > svg {
		filter: hue-rotate(180deg) brightness(0.8) saturate(2);
	}

	&.image {
		background: var(--border-color);
		mask-image: var(--icon-path);
	}
`

export const LabelContainer = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	width: 250px;
	transform: translateY(50%);
	left: calc(100% + 8px);
	bottom: calc(50% + 1px);
	z-index: 10;
	pointer-events: none;
	white-space: nowrap;
`

export const Label = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8px;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 8px;
	font-weight: 600;
	-webkit-backdrop-filter: blur(8px);
	backdrop-filter: blur(8px);
`

export const TimestampPopover = styled.div<{ $theme: CustomTheme }>`
	position: absolute;
	bottom: calc(100% + 8px);
	left: 50%;
	transform: translateX(-50%);
	padding: 6px 12px;
	background: ${(props) => props.$theme.custom.palette.background.timelineMarkerTail};
	border: 1px solid ${(props) => props.$theme.material.palette.divider};
	border-radius: 6px;
	white-space: nowrap;
	pointer-events: none;
	opacity: 0;
	transition: opacity 0.2s;
	z-index: 100;

	&.visible {
		opacity: 1;
	}
`
