import styled from 'styled-components'

export const Group = styled.div.attrs<{ $height: number }>((props) => ({
	style: {
		bottom: `${props.$height}px`,
	},
}))`
	position: absolute;
	bottom: 0;
	transition: opacity 0.3s;
	z-index: 1;
	pointer-events: auto;

	opacity: 0;
	pointer-events: auto;
	transform: translateX(var(--position));

	&.visible {
		opacity: 1;
	}
`

export const TrackContainer = styled.div<{ $height: number; $hoverBg: string; $activeBg: string }>`
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
		background: ${(props) => props.$hoverBg};
	}
`
