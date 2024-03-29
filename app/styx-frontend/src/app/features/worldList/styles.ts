import styled from 'styled-components'

export const WorldsUnit = styled.fieldset`
	display: flex;
	flex-direction: column;
	gap: 8px;
	border-radius: 4px;
	border: 1px solid rgba(255, 255, 255, 0.23);
	padding: 8px;
	position: relative;
	margin-top: -8.5px;

	@media all and (min-width: 900px) {
		height: 100%;
	}
`
