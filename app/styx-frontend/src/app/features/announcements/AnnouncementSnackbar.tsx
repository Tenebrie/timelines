import Notifications from '@mui/icons-material/Notifications'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { useCallback, useState } from 'react'

import { useEventBusDispatch } from '../eventBus'
import { useEventBusSubscribe } from '../eventBus'

export const AnnouncementSnackbar = () => {
	const [open, setOpen] = useState(false)
	const requestOpenAnnouncements = useEventBusDispatch['announcements/requestOpen']()

	useEventBusSubscribe['calliope/announcementReceived']({
		callback: useCallback(() => {
			setOpen(true)
		}, []),
	})

	const onClose = useCallback((_?: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return
		}
		setOpen(false)
	}, [])

	const onClick = useCallback(() => {
		setOpen(false)
		requestOpenAnnouncements()
	}, [requestOpenAnnouncements])

	return (
		<Snackbar open={open} autoHideDuration={5000} onClose={onClose}>
			<Alert
				onClose={onClose}
				severity="info"
				icon={<Notifications fontSize="inherit" />}
				sx={{ width: '100%', cursor: 'pointer' }}
				onClick={onClick}
			>
				You have a new notification!
			</Alert>
		</Snackbar>
	)
}
