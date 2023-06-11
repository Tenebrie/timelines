import ListItemIcon from '@mui/material/ListItemIcon'

import { useEventIcons } from '../../../../hooks/useEventIcons'
import { useWorldRouter } from '../../../../router'
import { WorldEvent } from '../../../../types'
import { StyledListItemButton, StyledListItemText } from '../../styles'

type Props = {
	event: WorldEvent & { highlighted: boolean; secondary: string }
}

export const OutlinerEvent = ({ event }: Props) => {
	const { navigateToEventEditor } = useWorldRouter()
	const { getIconPath } = useEventIcons()

	return (
		<StyledListItemButton selected={event.highlighted} onClick={() => navigateToEventEditor(event.id)}>
			<ListItemIcon>
				<img src={getIconPath(event.icon)} height="24px" alt={`${event.icon} icon`} />
			</ListItemIcon>
			<StyledListItemText data-hj-suppress primary={event.name} secondary={event.secondary} />
		</StyledListItemButton>
	)
}
