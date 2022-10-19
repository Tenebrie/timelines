import styled from 'styled-components'

export const TimelineContainer = styled.div`
	position: relative;
	width: 100%;
	height: 256px;
	background: #1c4572;
	user-select: none;
`

export const TimelineAnchorLine = styled.div`
	position: absolute;
	width: 100%;
	height: 1px;
	top: 50%;
	background: gray;
`

export const Divider = styled.div.attrs<{ offset: number; height: number }>((props) => ({
	style: {
		transform: `translateX(${props.offset}px)`,
		height: `${8 * props.height}px`,
	},
}))<{ offset: number; height: number }>`
	position: absolute;
	background: gray;
	width: 1px;
	bottom: 0;
	pointer-events: none;
	left: 0;
`

export const MousePointer = styled.div.attrs<{ offset: number }>((props) => ({
	style: {
		transform: `translateX(${props.offset}px)`,
	},
}))<{ offset: number }>`
	left: 0;
	position: absolute;
	background: gray;
	width: 1px;
	height: 100%;
`
