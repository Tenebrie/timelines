import styled from 'styled-components'

export const WorldContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	max-height: 100%;
`

export const WorldContent = styled.div`
	width: 100%;
	flex-grow: 1;
	overflow: hidden;

	@media all and (max-width: 900px) {
		overflow: auto;
	}
`
