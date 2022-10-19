import styled from 'styled-components'

export const ModalContainer = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 1000;
	opacity: 0;
	pointer-events: none;
	transition: opacity 0.3s;

	&.visible {
		opacity: 1;
		pointer-events: all;
	}
`

export const ModalBody = styled.div`
	padding: 32px 64px;
	min-width: 768px;
	background: white;
	border-radius: 4px;
`
