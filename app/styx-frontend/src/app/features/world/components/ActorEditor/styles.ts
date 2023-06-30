import { Container } from '@mui/material'
import styled from 'styled-components'

import { ScrollbarStyling } from '../../../../styles'

export const FullHeightContainer = styled(Container)`
	@media all and (min-width: 900px) {
		height: 100%;
	}
`

export const StatementsUnit = styled.fieldset`
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

export const StatementsScroller = styled.div`
	width: 100%;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	& > * {
		flex-grow: 0;
		flex-shrink: 0;
	}

	${ScrollbarStyling}
`
