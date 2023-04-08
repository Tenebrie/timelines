import { colors } from '@mui/material'
import styled from 'styled-components'

export type StoryEventMarkerProps = {
	groupIndex: number
	expanded: boolean
}

export const Marker = styled.div<{ iconPath: string }>`
	position: relative;
	width: 50px;
	height: 50px;
	border-radius: 50%;
	background: rgba(0, 0, 0, 0.7);
	cursor: pointer;
	margin-bottom: -35px;
	transition: margin-bottom 0.3s, background-color 0.3s;
	background-image: url(${(props) => props.iconPath});
	background-origin: content-box;
	background-size: contain;
	outline: 2px solid white;

	&.expanded {
		margin-bottom: 4px;
	}

	&.selected {
		background-color: ${colors.orange[700]};
	}

	&.elevated {
	}

	&.highlighted {
		background-color: ${colors.deepPurple[700]};
	}

	&:hover {
		background-color: ${colors.orange[500]};
	}

	&:active {
		background-color: ${colors.orange[900]};
	}
`

export const LabelContainer = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	width: 250px;
	left: calc(100% + 4px);
	top: 0;
	height: 100%;
	z-index: 1;
	pointer-events: none;
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
