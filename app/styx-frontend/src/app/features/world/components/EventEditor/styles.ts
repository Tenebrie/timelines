import styled from 'styled-components'

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

export const StatementsUnit = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	border-radius: 4px;
	border: 1px solid rgba(255, 255, 255, 0.23);
	padding: 8px;
	min-height: 256px;
	height: 100%;
	position: relative;
`

export const StatementsScroller = styled.div`
	width: 100%;
	overflow: scroll;
	display: flex;
	flex-direction: column;
	gap: 8px;
	& > * {
		flex-grow: 0;
		flex-shrink: 0;
	}
`
