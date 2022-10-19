import styled from 'styled-components'

export const TimelineAnchorContainer = styled.div.attrs<{ offset: number }>((props) => ({
	style: {
		transform: `translateX(${props.offset}px)`,
	},
}))<{ offset: number }>`
	position: absolute;
	width: fit-content;
	bottom: 0;
	transition: transform 0.3s;
`

export const DividerContainer = styled.div.attrs<{ offset: number }>((props) => ({
	style: {
		transform: `translateX(${props.offset}px)`,
	},
}))<{ offset: number }>`
	position: absolute;
	left: 0;
	bottom: 0;
	pointer-events: none;
	transition: transform 0.3s;
`

export const Divider = styled.div.attrs<{ height: number }>((props) => ({
	style: {
		height: `${8 * props.height}px`,
	},
}))<{ height: number }>`
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
	opacity: 0;
	transition: opacity 0.3s;

	&.visible {
		opacity: 1;
	}
`
