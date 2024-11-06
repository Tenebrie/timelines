import styled from 'styled-components'

export const Group = styled.div.attrs<{ $position: number }>((props) => ({
	style: {
		// left: `calc(${props.$position}px - 29px)`,
		transform: `translateX(${props.$position - 29}px)`,
	},
}))<{ $position: number }>`
	display: flex;
	flex-direction: column-reverse;
	position: absolute;
	top: calc(50% - 10px);
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

export const Chain = styled.div.attrs<{ $position: number }>((props) => ({
	style: {
		// left: `calc(${props.$position}px)`,
		transform: `translateX(${props.$position}px)`,
	},
}))<{ $position: number }>`
	display: flex;
	position: absolute;
	top: calc(50%);
	opacity: 0;
	transition: opacity 0.3s;
	z-index: 1;
	pointer-events: none;

	&.visible {
		opacity: 1;
	}
`

export const TrackContainer = styled.div`
	position: relative;
	height: 96px;
	display: flex;
	flex-direction: row;
	width: 100%;
	align-items: center;

	pointer-events: none;
	background: none;

	&.dragging:hover {
		pointer-events: auto;
		background: rgb(255 255 255 / 10%);
	}
`

export const TrackPositioner = styled.div.attrs<{ $position: number }>((props) => ({
	style: {
		transform: `translateX(${props.$position}px)`,
	},
}))`
	background: red;
`
