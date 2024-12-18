import Container from '@mui/material/Container'
import styled from 'styled-components'

import { ScrollbarStyling } from '@/app/styles'

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
