import ExpandMore from '@mui/icons-material/ExpandMore'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import styled from 'styled-components'

export const StyledListItemButton = styled(ListItemButton)`
	&:hover {
		transition: none;
	}
`

export const StyledListItemText = styled(ListItemText)`
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
