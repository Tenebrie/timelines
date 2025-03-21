import { useUpdateProfile } from '@api/hooks/useUpdateProfile'
import SaveIcon from '@mui/icons-material/Save'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useSelector } from 'react-redux'
import { z } from 'zod'

import { ApiErrorBanner } from '@/app/components/ApiErrorBanner'
import { SaveButton } from '@/app/components/SaveButton'
import { User } from '@/app/features/auth/AuthSlice'
import { getAuthState } from '@/app/features/auth/AuthSliceSelectors'
import { BoundTextField } from '@/app/features/forms/components/BoundTextField'
import { useAppForm } from '@/app/features/forms/useAppForm'

export function PublicProfilePage() {
	const { user } = useSelector(getAuthState)

	if (!user) {
		return null
	}

	return <InternalComponent user={user} />
}

type Props = {
	user: User
}

function InternalComponent({ user }: Props) {
	const [updateProfile, apiState] = useUpdateProfile()
	const { isLoading, isError } = apiState

	const form = useAppForm({
		defaultValues: {
			username: user!.username,
			bio: user!.bio,
		},
		validators: {
			onChange: z.object({ username: z.string().min(1), bio: z.string() }),
			onSubmit: z.object({ username: z.string().min(1), bio: z.string() }),
		},
		onSubmit: async (data) => {
			await updateProfile(data.value)
		},
	})

	return (
		<>
			<Typography variant="h5" sx={{ mb: 3 }}>
				Public profile
			</Typography>

			<Stack direction="row" spacing={3}>
				<Stack flex={1} spacing={3}>
					<TextField
						label="Email"
						fullWidth
						defaultValue={user.email}
						disabled
						helperText="Your unique email address"
					/>
					<form.AppField name="username">
						{() => (
							<BoundTextField
								label="Name"
								fullWidth
								helperText="Your name may appear around the application where you contribute or are mentioned."
							/>
						)}
					</form.AppField>
					<form.AppField name="bio">
						{() => (
							<BoundTextField
								label="Bio"
								fullWidth
								multiline
								rows={4}
								helperText="Tell us a little bit about yourself"
							/>
						)}
					</form.AppField>

					<ApiErrorBanner apiState={apiState} />

					<Stack direction="row" spacing={2} justifyContent="flex-end">
						<SaveButton
							variant="contained"
							sx={{ minWidth: 100 }}
							onClick={form.handleSubmit}
							isSaving={isLoading}
							isError={isError}
							defaultIcon={<SaveIcon />}
						>
							Update profile
						</SaveButton>
					</Stack>
				</Stack>

				<Stack direction="row" spacing={4}>
					<Stack alignItems="center" width={280}>
						<Avatar src={user.avatarUrl} alt="Profile picture" sx={{ width: 260, height: 260, mb: 2 }} />
						<Button variant="outlined" fullWidth>
							Change picture
						</Button>
					</Stack>
				</Stack>
			</Stack>
		</>
	)
}
