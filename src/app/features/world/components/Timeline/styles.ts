import styled from 'styled-components'

export const TimelineContainer = styled.div`
	position: relative;
	width: 100%;
	height: 256px;
	background: #1c4572;
	user-select: none;
	overflow-x: clip;

	cursor: grab;

	&:active {
		cursor: grabbing;
	}
`
