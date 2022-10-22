import styled from 'styled-components'

export const ModalWrapper = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	box-sizing: border-box;
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

export const ModalContainer = styled.div`
	padding: 32px 64px;
	min-width: 768px;
	background: #0d2d50;
	border-radius: 4px;
	display: flex;
	gap: 16px;
	flex-direction: column;
`

export const ModalHeader = styled.h2`
	margin: none;
	padding: none;
	font-family: 'Roboto';
`
