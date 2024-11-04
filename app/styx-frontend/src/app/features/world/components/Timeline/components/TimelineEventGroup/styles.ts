import styled from 'styled-components'

export const Group = styled.div.attrs<{ $position: number }>((props) => ({
	style: {
		left: `calc(${props.$position}px - 29px)`,
	},
}))<{ $position: number }>`
	display: flex;
	flex-direction: column-reverse;
	position: absolute;
	top: calc(50% - 29px);
	padding: 5px;
	opacity: 0;
	transition: opacity 0.3s;
	z-index: 1;
	pointer-events: auto;

	&.visible {
		opacity: 1;
	}

	&.expanded {
		z-index: 2;
	}

	&.dragging {
		z-index: 3;
	}
`
