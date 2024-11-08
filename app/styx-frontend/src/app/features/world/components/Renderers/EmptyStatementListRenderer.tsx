import { Typography } from '@mui/material'
import ListItemText from '@mui/material/ListItemText'

import { StyledListItemButton, ZebraWrapper } from '../Outliner/styles'

export const EmptyStatementListRenderer = () => {
	return (
		<ZebraWrapper $zebra>
			<StyledListItemButton selected={false}>
				<ListItemText
					primary={<Typography sx={{ fontSize: 16 }}>No content to show!</Typography>}
				></ListItemText>
			</StyledListItemButton>
		</ZebraWrapper>
	)
}
