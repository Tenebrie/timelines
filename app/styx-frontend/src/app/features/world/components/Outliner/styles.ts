import styled from 'styled-components'

export const OutlinerContainer = styled.div`
	height: 100%;
	display: flex;
	flex-direction: column;
	gap: 12px;
`

// export const StatementsUnit = styled.div`
// 	position: relative;
// 	display: flex;
// 	flex-direction: column;
// 	border-radius: 4px;
// 	border: 1px solid rgba(255, 255, 255, 0.23);
// 	padding: 8px;
// 	overflow: scroll;

// 	& > p:first-child {
// 		margin-block-start: 0.25em;
// 	}
// `

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
