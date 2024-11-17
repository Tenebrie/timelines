import styled from 'styled-components'

export const WorldContainer = styled.div`
	display: flex;
	flex-direction: row;
	width: 100%;
	height: 100%;
	max-height: 100%;
	min-height: 0;
`

export const WorldContent = styled.div`
	width: 100%;
	flex-grow: 1;
	height: 0;

	overflow: auto;
`
