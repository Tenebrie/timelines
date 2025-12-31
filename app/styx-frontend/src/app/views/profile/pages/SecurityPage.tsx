import { useChangePasswordMutation } from '@api/profileApi'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import LockResetIcon from '@mui/icons-material/LockReset'
import SaveIcon from '@mui/icons-material/Save'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { z } from 'zod'

import { ApiErrorBanner } from '@/app/components/ApiErrorBanner'
import { SaveButton } from '@/app/components/SaveButton'
import { BoundTextField } from '@/app/features/forms/components/BoundTextField'
import { useAppForm } from '@/app/features/forms/useAppForm'
import { useModal } from '@/app/features/modals/ModalsSlice'

export function SecurityPage() {
	const [changePassword, changePasswordState] = useChangePasswordMutation()
	const { open: openDeleteAccountModal } = useModal('deleteAccountModal')

	const passwordForm = useAppForm({
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
		validators: {
			onChange: z.object({
				currentPassword: z.string().min(1, 'Current password is required'),
				newPassword: z.string().min(12, 'New password must be at least 12 characters'),
				confirmPassword: z.string().min(1, 'Please confirm your password'),
			}),
			onSubmit: z
				.object({
					currentPassword: z.string().min(1, 'Current password is required'),
					newPassword: z.string().min(12, 'New password must be at least 12 characters'),
					confirmPassword: z.string().min(1, 'Please confirm your password'),
				})
				.refine((data) => data.newPassword === data.confirmPassword, {
					message: "Passwords don't match",
					path: ['confirmPassword'],
				}),
		},
		onSubmit: async (data) => {
			const result = await changePassword({
				body: {
					currentPassword: data.value.currentPassword,
					newPassword: data.value.newPassword,
				},
			})

			if ('data' in result) {
				passwordForm.reset()
			}
		},
	})

	return (
		<Stack gap={3}>
			<Stack gap={2}>
				<Typography variant="h5">Security</Typography>
				<Divider />
			</Stack>

			<Stack spacing={3}>
				<Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<LockResetIcon /> Change password
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Update your password to keep your account secure. Make sure to use a strong, unique password.
				</Typography>

				<passwordForm.AppField name="currentPassword">
					{() => (
						<BoundTextField
							label="Current password"
							type="password"
							fullWidth
							helperText="Enter your current password"
						/>
					)}
				</passwordForm.AppField>

				<passwordForm.AppField name="newPassword">
					{() => (
						<BoundTextField
							label="New password"
							type="password"
							fullWidth
							helperText="Must be at least 8 characters"
						/>
					)}
				</passwordForm.AppField>

				<passwordForm.AppField name="confirmPassword">
					{() => (
						<BoundTextField
							label="Confirm new password"
							type="password"
							fullWidth
							helperText="Re-enter your new password"
						/>
					)}
				</passwordForm.AppField>

				<ApiErrorBanner apiState={changePasswordState} />

				<Stack direction="row" spacing={2} justifyContent="flex-end">
					<SaveButton
						variant="contained"
						sx={{ minWidth: 100 }}
						onClick={passwordForm.handleSubmit}
						isSaving={changePasswordState.isLoading}
						isError={changePasswordState.isError}
						defaultIcon={<SaveIcon />}
					>
						Change password
					</SaveButton>
				</Stack>
			</Stack>

			<Divider />

			<Stack spacing={2}>
				<Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
					Danger zone
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Once you delete your account, there is no going back. This action will permanently delete all your
					worlds, timelines, and data.
				</Typography>

				<Box>
					<Button
						variant="outlined"
						startIcon={<DeleteForeverIcon />}
						onClick={() => openDeleteAccountModal({})}
					>
						Delete account
					</Button>
				</Box>
			</Stack>
		</Stack>
	)
}
