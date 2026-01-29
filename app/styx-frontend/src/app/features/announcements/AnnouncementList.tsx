import Check from '@mui/icons-material/Check'
import Close from '@mui/icons-material/Close'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useRef } from 'react'

import { useDismissAnnouncementMutation } from '@/api/announcementListApi'

import { useGetAnnouncements } from './hooks/useGetAnnouncements'

export const AnnouncementList = () => {
	const { data } = useGetAnnouncements()

	const lastDismissedAnnouncement = useRef<string | null>(null)
	const [dismissAnnouncement] = useDismissAnnouncementMutation()

	const onDismiss = useCallback(
		async (id: string) => {
			lastDismissedAnnouncement.current = id
			await dismissAnnouncement({
				id,
			})
		},
		[dismissAnnouncement],
	)

	return (
		<List sx={{ marginX: 1, marginY: 0.5 }}>
			{(!data || data?.length === 0) && (
				<Stack marginX={1} marginY={0.5} gap={2} alignItems="center">
					<Check />
					<Typography>All clear!</Typography>
				</Stack>
			)}
			{data?.map((announcement) => (
				<Alert
					key={announcement.id}
					variant="outlined"
					severity="info"
					action={
						<IconButton
							onClick={() => onDismiss(announcement.id)}
							disabled={lastDismissedAnnouncement.current === announcement.id}
						>
							<Close />
						</IconButton>
					}
				>
					<AlertTitle>{announcement.title}</AlertTitle>
					{announcement.description}
				</Alert>
			))}
		</List>
	)
}
