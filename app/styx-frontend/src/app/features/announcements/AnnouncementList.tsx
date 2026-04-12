import Check from '@mui/icons-material/Check'
import Close from '@mui/icons-material/Close'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useRef } from 'react'

import { useDismissAllAnnouncementsMutation, useDismissAnnouncementMutation } from '@/api/announcementListApi'

import { FormattedAnnouncementText } from './components/FormattedAnnouncementText'
import { useGetAnnouncements } from './hooks/useGetAnnouncements'

type Props = {
	onClose: () => void
}

export const AnnouncementList = ({ onClose }: Props) => {
	const { data } = useGetAnnouncements()

	const lastDismissedAnnouncement = useRef<string | null>(null)
	const [dismissAnnouncement] = useDismissAnnouncementMutation()
	const [dismissAllAnnouncements] = useDismissAllAnnouncementsMutation()

	const onDismiss = useCallback(
		async (id: string) => {
			lastDismissedAnnouncement.current = id
			if (data?.length === 1) {
				onClose()
			}
			await dismissAnnouncement({
				id,
			})
		},
		[data?.length, dismissAnnouncement, onClose],
	)

	const onDismissAll = useCallback(async () => {
		onClose()
		await dismissAllAnnouncements()
	}, [dismissAllAnnouncements, onClose])

	return (
		<List sx={{ marginX: 1, marginY: 0.5, minWidth: 300, maxWidth: 400, maxHeight: 800 }}>
			{(!data || data?.length === 0) && (
				<Stack marginX={1} marginY={0.5} gap={2} alignItems="center" direction="row">
					<Check />
					<Typography>All clear!</Typography>
				</Stack>
			)}
			<Stack gap={1}>
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
						<FormattedAnnouncementText text={announcement.description} />
					</Alert>
				))}
				{data && data.length >= 3 && <Button onClick={onDismissAll}>Dismiss all notifications</Button>}
			</Stack>
		</List>
	)
}
