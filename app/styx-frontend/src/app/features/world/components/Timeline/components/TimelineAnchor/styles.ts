import styled from 'styled-components'

export const TimelineAnchorContainer = styled.div.attrs<{ offset: number }>((props) => ({
	style: {
		transform: `translateX(${props.offset}px)`,
	},
}))<{ offset: number }>`
	position: absolute;
	width: fit-content;
	bottom: 0;
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

export const DividerLabel = styled.div`
	position: absolute;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	white-space: pre;
	color: #eaeff1;
`
