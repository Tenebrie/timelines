import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { User } from '@/app/features/auth/AuthSlice'

type Props = {
	user: User
}

export function Profile({ user }: Props) {
	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Stack direction="row" spacing={3}>
				{/* Sidebar */}
				<Paper sx={{ width: 250, p: 2 }} elevation={1}>
					<Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
						Settings
					</Typography>
					<Stack spacing={1}>
						<Button
							fullWidth
							sx={{
								justifyContent: 'flex-start',
								px: 2,
								py: 1,
								textTransform: 'none',
								fontWeight: (theme) => theme.typography.fontWeightRegular,
								'&.active': {
									fontWeight: (theme) => theme.typography.fontWeightBold,
									bgcolor: 'action.hover',
								},
							}}
							className="active"
						>
							Public profile
						</Button>
						<Button
							fullWidth
							sx={{
								justifyContent: 'flex-start',
								px: 2,
								py: 1,
								textTransform: 'none',
								fontWeight: (theme) => theme.typography.fontWeightRegular,
							}}
						>
							Storage
						</Button>
					</Stack>
				</Paper>

				{/* Main Content */}
				<Paper sx={{ flex: 1, p: 3, maxWidth: 800 }} elevation={1}>
					<Typography variant="h5" sx={{ mb: 3 }}>
						Public profile
					</Typography>

					<Stack direction="row" spacing={4}>
						<Stack flex={1} spacing={3}>
							<TextField
								label="Email"
								fullWidth
								defaultValue={user.email}
								disabled
								helperText="Select a verified email to display"
							/>
							<TextField
								label="Name"
								fullWidth
								defaultValue={user.username}
								helperText="Your name may appear around the application where you contribute or are mentioned."
							/>
							<TextField
								label="Bio"
								fullWidth
								multiline
								rows={4}
								defaultValue={user.id}
								helperText="Tell us a little bit about yourself"
							/>
						</Stack>

						<Stack alignItems="center" width={280}>
							<Avatar src={user.avatarUrl} alt="Profile picture" sx={{ width: 260, height: 260, mb: 2 }} />
							<Button variant="outlined" fullWidth>
								Change picture
							</Button>
						</Stack>
					</Stack>
				</Paper>
			</Stack>
		</Container>
	)
}
