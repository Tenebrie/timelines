import styled from 'styled-components'

export const MarkerContainer = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 250px;
	margin-left: -125px;
	top: 32px;
`

export const MarkerLabel = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8px;
	background: rgba(100, 100, 150, 1);
	border-radius: 8px;
	font-weight: 600;
	user-select: none;
	cursor: pointer;
`
