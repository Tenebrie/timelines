import { ClearAll, Close } from '@mui/icons-material'
import { Alert, AlertTitle, IconButton, List, Stack, Typography } from '@mui/material'
import { useCallback, useRef } from 'react'

import { useDismissAnnouncementMutation, useGetAnnouncementsQuery } from '../../../api/rheaApi'

export const AnnouncementList = () => {
	const { data } = useGetAnnouncementsQuery()

	const lastDismissedAnnouncement = useRef<string | null>(null)
	const [dismissAnnouncement] = useDismissAnnouncementMutation()

	const onDismiss = useCallback(
		async (id: string) => {
			lastDismissedAnnouncement.current = id
			await dismissAnnouncement({
				id,
			})
		},
		[dismissAnnouncement]
	)

	return (
		<List sx={{ marginX: 1, marginY: 0.5 }}>
			{(!data || data?.length === 0) && (
				<Stack marginX={1} marginY={0.5} gap={2} alignItems="center">
					<ClearAll />
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
