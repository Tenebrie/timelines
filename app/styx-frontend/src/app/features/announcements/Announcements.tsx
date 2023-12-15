import { Notifications } from '@mui/icons-material'
import { Badge, IconButton, Popover } from '@mui/material'
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'

import { useGetAnnouncementsQuery } from '../../../api/rheaApi'
import { AnnouncementList } from './AnnouncementList'

export const Announcements = () => {
	const { data } = useGetAnnouncementsQuery()
	const popupState = usePopupState({ variant: 'popover', popupId: 'announcements' })

	return (
		<>
			<IconButton {...bindTrigger(popupState)}>
				<Badge badgeContent={data?.length ?? 0} color="primary" variant="dot">
					<Notifications />
				</Badge>
			</IconButton>
			<Popover
				{...bindPopover(popupState)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
			>
				<AnnouncementList />
			</Popover>
		</>
	)
}
