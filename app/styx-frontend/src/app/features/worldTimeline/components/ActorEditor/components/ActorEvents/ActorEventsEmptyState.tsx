import ListItemText from '@mui/material/ListItemText'

import { StyledListItemButton, ZebraWrapper } from './styles'

export const ActorEventsEmptyState = () => {
	return (
		<ZebraWrapper $zebra={true}>
			<StyledListItemButton selected={false}>
				<ListItemText primary="No events to show!"></ListItemText>
			</StyledListItemButton>
		</ZebraWrapper>
	)
}
