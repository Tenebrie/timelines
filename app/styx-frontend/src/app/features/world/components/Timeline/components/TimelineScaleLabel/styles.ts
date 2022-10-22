import styled from 'styled-components'

export const Container = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
	font-size: 100px;
	color: #2c5582;
	gap: 32px;

	opacity: 0;
	transition: opacity 0.3s;
	&.visible {
		opacity: 1;
	}
`

export const Label = styled.div`
	width: 100px;
	display: flex;
	align-items: center;
	justify-content: center;
`

export const LeftLabel = styled(Label)`
	justify-content: right;
`

export const RightLabel = styled(Label)`
	justify-content: left;
`
