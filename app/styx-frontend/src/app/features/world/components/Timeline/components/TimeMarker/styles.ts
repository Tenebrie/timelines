import styled from 'styled-components'

export const Container = styled.div.attrs<{ offset: number }>((props) => ({
	style: {
		transform: `translateX(${props.offset}px)`,
	},
}))<{ offset: number }>`
	top: 0;
	position: absolute;
	background: gray;
	width: 1px;
	height: 100%;
	opacity: 1;
	transition: opacity 0.3s;
	pointer-events: none;

	&.hidden {
		opacity: 0;
	}
`
