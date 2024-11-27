import { ExpandMore } from '@mui/icons-material'
import { ListItemButton, ListItemText } from '@mui/material'
import styled from 'styled-components'

import { ScrollbarStyling } from '@/app/styles'

export const OutlinerContainer = styled.div`
	flex: 1;
	height: calc(100% - 32px);
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 16px;
`

export const StatementsScroller = styled.div`
	width: 100%;
	height: 100%;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	justify-content: center;
	& > * {
		flex-grow: 0;
		flex-shrink: 0;
	}

	${ScrollbarStyling}
`

export const StyledListItemButton = styled(ListItemButton)`
	&:hover {
		transition: none;
	}
`

export const StyledListItemText = styled(ListItemText)`
	width: 1px;
	& > .MuiTypography-root {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
`

export const ExpandIcon = styled(ExpandMore)<{ rotated: 0 | 1 }>`
	transform: rotate(${(props) => (props.rotated ? '180deg' : 0)});
	transition: transform 0.3s;
`

export const ZebraWrapper = styled.div<{ $zebra: boolean }>`
	background: ${(props) => (props.$zebra ? 'rgba(255, 255, 255, 0.03)' : 'none')};
`

export const StatementColoredActor = styled.div`
	color: purple;
`

export const StatementActorsText = styled.span`
	align-items: center;
	display: flex;
	gap: 4px;
	flex-wrap: wrap;
`
