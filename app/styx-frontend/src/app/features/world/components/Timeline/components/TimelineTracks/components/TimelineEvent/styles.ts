import { colors } from '@mui/material'
import styled from 'styled-components'

export type StoryEventMarkerProps = {
	groupIndex: number
	expanded: boolean
}

export const Marker = styled.div<{ $iconPath: string; $borderColor: string }>`
	position: relative;
	width: 24px;
	height: 24px;
	border-radius: 4px;
	background: #0a1929;
	cursor: pointer;
	transition:
		margin-bottom 0.3s,
		border-color 0.3s,
		background-color 0.3s;
	border: 2px solid ${colors.grey[300]};
	border-color: ${(props) => props.$borderColor} !important;

	.icon {
		position: absolute;
		background: ${colors.green[300]};
		mask-image: url(${(props) => props.$iconPath});
		mask-size: cover;
		mask-position: 0px 0px;
		mask-repeat: no-repeat;
		background-origin: content-box;
		background-size: contain;
		width: calc(100%);
		height: calc(100%);
		transition: background-color 0.3s;
	}

	&.ghostEvent {
		background-color: rgb(28, 69, 114);
		pointer-events: none;
		.icon {
			opacity: 0.5;
		}
	}

	&.ghostDelta {
		background-color: rgb(28, 69, 114);
		pointer-events: none;
		.icon {
			opacity: 0.5;
		}
	}

	&:hover {
		& > .icon {
			background: ${colors.green[500]};
		}
	}
	&:active {
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

	&.edited {
		box-shadow: 0 0 10px 10px rgb(0, 100, 0);
	}
	&.replace.edited {
		box-shadow: 0 0 10px 10px rgb(100, 100, 0);
	}
	&.revoked.edited {
		box-shadow: 0 0 10px 10px rgb(75, 0, 0);
	}

	&.selected {
		background-color: rgb(0, 100, 0);
	}
	&.replace.selected {
		background-color: rgb(100, 100, 0);
	}
	&.revoked.selected {
		background-color: rgb(100, 0, 0);
	}
`

export const LabelContainer = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	width: 250px;
	transform: translateY(50%);
	left: calc(100% + 8px);
	bottom: calc(50%);
	z-index: 10;
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
