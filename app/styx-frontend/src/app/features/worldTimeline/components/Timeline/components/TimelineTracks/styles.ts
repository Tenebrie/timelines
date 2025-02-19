import styled from 'styled-components'

export const Group = styled.div.attrs<{ $position: number; $height: number }>((props) => ({
	style: {
		left: `${props.$position}px`,
		bottom: `${props.$height}px`,
	},
}))<{ $position: number }>`
	position: absolute;
	bottom: 0;
	transition: opacity 0.3s;
	z-index: 1;
	pointer-events: auto;

	opacity: 0;
	pointer-events: auto;

	&.visible {
		opacity: 1;
	}
`

export const Chain = styled.div.attrs<{ $position: number }>((props) => ({
	style: {
		left: `calc(${props.$position}px`,
	},
}))<{ $position: number }>`
	display: flex;
	position: absolute;
	opacity: 0;
	transition: opacity 0.3s;
	pointer-events: none;

	&.visible {
		opacity: 1;
	}
`

export const TrackContainer = styled.div<{ $height: number; $background: string }>`
	position: relative;
	height: ${(props) => props.$height}px;
	display: flex;
	flex-direction: row;
	width: 100%;
	align-items: flex-end;

	pointer-events: auto;
	background: none;
	transition: background 0.3s;

	body:not(.mouse-busy) &:hover {
		background: ${(props) => props.$background};
	}
`
