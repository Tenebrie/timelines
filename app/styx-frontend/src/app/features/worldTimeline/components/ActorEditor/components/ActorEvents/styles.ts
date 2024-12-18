import ListItemButton from '@mui/material/ListItemButton'
import styled from 'styled-components'

export const StyledListItemButton = styled(ListItemButton)`
	&:hover {
		transition: none;
	}
`

export const ZebraWrapper = styled.div<{ $zebra: boolean }>`
	background: ${(props) => (props.$zebra ? 'rgba(255, 255, 255, 0.03)' : 'none')};
`
