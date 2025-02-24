import Container from '@mui/material/Container'
import styled from 'styled-components'

import { ScrollbarStyling } from '@/app/styles'

export const EventEditorWrapper = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`

export const EventEditorContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`

export const BasicInputs = styled.div`
	display: flex;
	gap: 16px;
`

export const StatementsContainer = styled.div`
	display: flex;
	width: 100%;
	gap: 16px;
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

export const FullHeightContainer = styled(Container)`
	@media all and (min-width: 900px) {
		height: 100%;
	}
`
