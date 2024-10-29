import { colors } from '@mui/material'
import styled from 'styled-components'

export type StoryEventMarkerProps = {
	groupIndex: number
	expanded: boolean
}

export const Marker = styled.div<{ $iconPath: string }>`
	position: relative;
	width: 50px;
	height: 50px;
	border-radius: 50%;
	background: #0a1929;
	cursor: pointer;
	margin-bottom: -35px;
	transition:
		margin-bottom 0.3s,
		outline-color 0.3s,
		background-color 0.3s;
	outline: 2px solid ${colors.grey[300]};

	.icon {
		background: ${colors.green[300]};
		mask-image: url(${(props) => props.$iconPath});
		mask-size: contain;
		background-origin: content-box;
		background-size: contain;
		margin-top: 2px;
		margin-left: 2px;
		width: calc(100% - 4px);
		height: calc(100% - 4px);
		transition: background-color 0.3s;
	}

	&.ghostEvent {
		background-color: rgb(28, 69, 114);
		pointer-events: none;
		.icon {
			opacity: 0.5;
		}
	}

	&.expanded {
		margin-bottom: 4px;
	}

	&:hover {
		outline-color: ${colors.grey[500]};
		& > .icon {
			background: ${colors.green[500]};
		}
	}
	&:active {
		outline-color: ${colors.grey[700]};
		& > .icon {
			background: ${colors.green[700]};
		}
	}
	&.replace > .icon {
		background-color: ${colors.yellow[300]};
	}
	&.replace:hover > .icon {
		background-color: ${colors.yellow[500]};
	}
	&.replace:active > .icon {
		background-color: ${colors.yellow[700]};
	}
	&.revoked > .icon {
		background-color: ${colors.red[300]};
	}
	&.revoked:hover > .icon {
		background-color: ${colors.red[500]};
	}
	&.revoked:active > .icon {
		background-color: ${colors.red[700]};
	}

	&.selected {
		outline-color: ${colors.amber[300]};
	}
	&.selected:hover {
		outline-color: ${colors.amber[500]};
	}
	&.selected:active {
		outline-color: ${colors.amber[700]};
	}

	&.highlighted {
		background-color: rgb(0, 100, 0);
	}
	&.replace.highlighted {
		background-color: rgb(100, 100, 0);
	}
	&.revoked.highlighted {
		background-color: rgb(100, 0, 0);
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
