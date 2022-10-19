import styled from 'styled-components'

export const Group = styled.div.attrs<{ position: number }>((props) => ({
	style: {
		left: `${props.position}px`,
	},
}))<{ position: number }>`
	display: flex;
	flex-direction: column-reverse;
	position: absolute;
	bottom: 0;
	padding: 5px;
	margin-left: -30px;
	margin-bottom: 80px;
	transition: left 0.3s;
`
