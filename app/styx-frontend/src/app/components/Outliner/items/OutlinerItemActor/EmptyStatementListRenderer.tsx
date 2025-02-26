import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'

import {
	StyledListItemButton,
	ZebraWrapper,
} from '@/app/views/world/views/timeline/components/TimelineShelf/styles'

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
