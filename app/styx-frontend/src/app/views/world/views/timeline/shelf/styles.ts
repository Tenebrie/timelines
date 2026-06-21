import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import styled from 'styled-components'

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

export const ZebraWrapper = styled.div<{ $zebra: boolean }>`
	background: ${(props) => (props.$zebra ? 'rgba(255, 255, 255, 0.03)' : 'none')};
`

export const StatementActorsText = styled.span`
	align-items: center;
	display: flex;
	gap: 4px;
	flex-wrap: wrap;
`
