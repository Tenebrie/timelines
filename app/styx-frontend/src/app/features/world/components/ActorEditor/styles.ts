import { Container } from '@mui/material'
import styled from 'styled-components'

import { ScrollbarStyling } from '../../../../styles'

export const FullHeightContainer = styled(Container)`
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
