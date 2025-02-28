import Notifications from '@mui/icons-material/Notifications'
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'

import { useGetAnnouncementsQuery } from '@/api/announcementListApi'

import { AnnouncementList } from './AnnouncementList'

export const AnnouncementView = () => {
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
