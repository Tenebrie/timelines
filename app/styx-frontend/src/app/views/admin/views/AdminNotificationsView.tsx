import Send from '@mui/icons-material/Send'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AdminBroadcastNotificationApiResponse } from '@/api/adminNotificationsApi'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { getAdminPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { useDebounce } from '@/app/hooks/useDebounce'
import { useAdminBroadcastNotification } from '@/app/views/admin/api/useAdminBroadcastNotification'

export function AdminNotificationsView() {
	const theme = useTheme()
	const dispatch = useDispatch()
	const { notificationTitle: savedTitle, notificationDescription: savedDescription } =
		useSelector(getAdminPreferences)
	const { setAdminNotificationTitle, setAdminNotificationDescription, clearAdminNotificationDraft } =
		preferencesSlice.actions

	const [title, setTitle] = useState(savedTitle)
	const [description, setDescription] = useState(savedDescription)
	const [testCompleted, setTestCompleted] = useState(false)
	const [result, setResult] = useState<AdminBroadcastNotificationApiResponse | null>(null)
	const [error, setError] = useState<string | null>(null)

	const saveToLocalStorage = useDebounce(
		useCallback(
			(title: string, description: string) => {
				dispatch(setAdminNotificationTitle(title))
				dispatch(setAdminNotificationDescription(description))
			},
			[dispatch, setAdminNotificationDescription, setAdminNotificationTitle],
		),
		500,
	)

	const [broadcastNotification, { isLoading }] = useAdminBroadcastNotification()

	const isFormValid = title.trim().length > 0 && description.trim().length > 0

	const handleBroadcast = useCallback(
		async (fullRun: boolean = false) => {
			setResult(null)
			setError(null)

			const { response, error } = await broadcastNotification({
				title: title.trim(),
				description: description.trim(),
				fullRun,
			})

			if (error) {
				setError(error.message)
				return
			}

			setResult(response)
			setTestCompleted(!fullRun)

			if (fullRun) {
				dispatch(clearAdminNotificationDraft())
			}
		},
		[broadcastNotification, clearAdminNotificationDraft, dispatch, title, description],
	)

	const handleTestRun = useCallback(() => handleBroadcast(), [handleBroadcast])
	const handleFullRun = useCallback(() => handleBroadcast(true), [handleBroadcast])

	return (
		<Stack gap={3}>
			<Paper
				variant="outlined"
				sx={{
					padding: 2.5,
					borderRadius: 2,
					background: theme.palette.background.default,
				}}
			>
				<Typography variant="subtitle1" fontWeight={600} marginBottom={2}>
					Broadcast Notification
				</Typography>
				<Stack gap={2}>
					<TextField
						label="Title"
						value={title}
						onChange={(e) => {
							setTitle(e.target.value)
							saveToLocalStorage(e.target.value, description)
							setTestCompleted(false)
							setResult(null)
						}}
						fullWidth
						size="small"
					/>
					<TextField
						label="Text"
						value={description}
						onChange={(e) => {
							setDescription(e.target.value)
							saveToLocalStorage(title, e.target.value)
							setTestCompleted(false)
							setResult(null)
						}}
						fullWidth
						multiline
						minRows={3}
						size="small"
					/>
					<Stack direction="row" gap={2}>
						<Button
							variant="outlined"
							color="secondary"
							onClick={handleTestRun}
							disabled={!isFormValid || isLoading}
							startIcon={<Send />}
						>
							Test Run (Admins Only)
						</Button>
						<Button
							variant="contained"
							color="warning"
							onClick={handleFullRun}
							disabled={!isFormValid || !testCompleted || isLoading}
							startIcon={<Send />}
						>
							Broadcast to Users
						</Button>
					</Stack>
				</Stack>
			</Paper>

			{error && <Alert severity="error">{error}</Alert>}

			{result && (
				<Alert severity={result.mode === 'fullRun' ? 'success' : 'info'}>
					Notification sent to {result.recipientCount} {result.recipientCount === 1 ? 'user' : 'users'} (
					{result.mode === 'fullRun' ? 'full run' : 'test run — admins only'}).
				</Alert>
			)}
		</Stack>
	)
}
