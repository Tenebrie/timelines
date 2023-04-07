import styled from 'styled-components'

export const Container = styled.div`
	position: absolute;
	top: 0;
	height: 100%;
	width: 24px;
	background: rgba(255, 255, 255, 0.05);
	transition: background 0.3s;

	&.left {
		left: 0;
		cursor: w-resize;
	}

	&.right {
		right: 0;
		cursor: e-resize;
	}

	&:hover {
		background: rgba(255, 255, 255, 0.2);
	}
`
