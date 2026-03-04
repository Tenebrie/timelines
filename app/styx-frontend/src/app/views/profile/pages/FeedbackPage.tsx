import { useSendContactFormMessageMutation } from '@api/otherApi'
import SendIcon from '@mui/icons-material/Send'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { z } from 'zod'

import { ApiErrorBanner } from '@/app/components/ApiErrorBanner'
import { SaveButton } from '@/app/components/SaveButton'
import { BoundTextField } from '@/app/features/forms/components/BoundTextField'
import { useAppForm } from '@/app/features/forms/useAppForm'

export function FeedbackPage() {
	const [sendMessage, sendMessageState] = useSendContactFormMessageMutation()
	const [showSuccess, setShowSuccess] = useState(false)

	const form = useAppForm({
		defaultValues: {
			name: '',
			email: '',
			message: '',
		},
		validators: {
			onSubmit: z.object({
				name: z.string().max(1024, 'Name must be at most 1024 characters'),
				email: z.union([
					z
						.string()
						.email('Please enter a valid email address')
						.max(1024, 'Email must be at most 1024 characters'),
					z.literal(''),
				]),
				message: z
					.string()
					.min(1, 'Message is required')
					.max(4096, 'Message must be at most 4096 characters'),
			}),
		},
		onSubmit: async (data) => {
			const result = await sendMessage({
				body: {
					name: data.value.name || undefined,
					email: data.value.email || undefined,
					message: data.value.message,
					source: 'styx',
				},
			})

			if ('data' in result) {
				form.reset()
				setShowSuccess(true)
			}
		},
	})

	return (
		<Stack gap={2}>
			<Stack gap={2}>
				<Typography variant="h5">Feedback</Typography>
				<Divider />
			</Stack>

			<Typography variant="body2" color="text.secondary">
				Have a question, suggestion, or found a bug? Get in touch here!
			</Typography>

			<form.AppField name="name">{() => <BoundTextField label="Name (Optional)" fullWidth />}</form.AppField>

			<form.AppField name="email">
				{() => <BoundTextField label="Contact Email (Optional)" type="email" fullWidth />}
			</form.AppField>

			<form.AppField name="message">
				{() => <BoundTextField label="Message" multiline minRows={4} fullWidth />}
			</form.AppField>

			<ApiErrorBanner apiState={sendMessageState} />

			<Collapse in={showSuccess}>
				<Alert severity="success" onClose={() => setShowSuccess(false)}>
					Your message has been sent. Thank you for the feedback!
				</Alert>
			</Collapse>

			<Stack direction="row" spacing={2} justifyContent="flex-end">
				<SaveButton
					variant="contained"
					sx={{ minWidth: 100 }}
					onClick={form.handleSubmit}
					isSaving={sendMessageState.isLoading}
					isError={sendMessageState.isError}
					defaultIcon={<SendIcon />}
				>
					Send message
				</SaveButton>
			</Stack>
		</Stack>
	)
}
