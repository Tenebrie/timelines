import { AdminGetUsersApiResponse } from '@api/adminUsersApi'
import { useAdminUpdateUser } from '@api/hooks/useAdminUpdateUser'
import EditIcon from '@mui/icons-material/Edit'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { PopoverButton } from '@/ui-lib/components/PopoverButton/PopoverButton'

type Props = {
	user: AdminGetUsersApiResponse['users'][number]
}

export function UserEmailPopoverButton({ user }: Props) {
	const [email, setEmail] = useState(user.email)

	const [updateUser, { isLoading }] = useAdminUpdateUser()

	return (
		<PopoverButton
			size="small"
			icon={<EditIcon fontSize="small" />}
			tooltip="Edit email"
			popoverBody={() => (
				<>
					<Typography variant="subtitle2" fontWeight="bold">
						Edit user email
					</Typography>
					<TextField
						label="New email"
						size="small"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						onKeyDown={async (e) => {
							if (e.key !== 'Enter') {
								return
							}
							const returnValue = await updateUser(user.id, {
								email: email,
							})
							if (returnValue.response) {
								close()
							}
						}}
						autoFocus
						fullWidth
						disabled={isLoading}
					/>
				</>
			)}
			popoverAction={({ close }) => (
				<>
					<Button size="small" onClick={close}>
						Cancel
					</Button>
					<Button
						variant="contained"
						size={'small'}
						onClick={async () => {
							const returnValue = await updateUser(user.id, {
								email: email,
							})
							if (returnValue.response) {
								close()
							}
						}}
						startIcon={<EditIcon fontSize="small" />}
						disabled={isLoading}
					>
						Save
					</Button>
				</>
			)}
		/>
	)
}
