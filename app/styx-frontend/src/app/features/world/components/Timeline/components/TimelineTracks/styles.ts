import styled from 'styled-components'

export const Group = styled.div.attrs<{ $position: number; $height: number }>((props) => ({
	style: {
		// left: `calc(${props.$position}px - 29px)`,
		transform: `translateX(${props.$position - 9}px)`,
		bottom: `${props.$height}px`,
	},
}))<{ $position: number }>`
	position: absolute;
	bottom: 0;
	transition: opacity 0.3s;
	z-index: 1;
	pointer-events: auto;
`

export const Chain = styled.div.attrs<{ $position: number }>((props) => ({
	style: {
		// left: `calc(${props.$position}px)`,
		transform: `translateX(${props.$position}px)`,
	},
}))<{ $position: number }>`
	display: flex;
	position: absolute;
	opacity: 0;
	transition: opacity 0.3s;
	z-index: 1;
	pointer-events: none;

	&.visible {
		opacity: 1;
	}
`

export const TrackContainer = styled.div<{ $height: number }>`
	position: relative;
	height: ${(props) => props.$height}px;
	display: flex;
	flex-direction: row;
	width: 100%;
	align-items: flex-end;

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
		// left: `${props.$position}px`,
	},
}))`
	position: absolute;
`
