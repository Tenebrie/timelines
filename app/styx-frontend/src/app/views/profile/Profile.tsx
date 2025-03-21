import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Outlet } from '@tanstack/react-router'

import { PageButton } from './components/PageButton'

export function Profile() {
	return (
		<Container maxWidth="lg" sx={{ py: 4, height: '100%' }}>
			<Stack direction="row" spacing={3}>
				{/* Sidebar */}
				<Paper sx={{ width: 250, p: 2 }} elevation={1}>
					<Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
						Settings
					</Typography>
					<Stack spacing={1}>
						<PageButton label="Public profile" route="/profile/public" />
						<PageButton label="Storage" route="/profile/storage" />
					</Stack>
				</Paper>

				{/* Main Content */}
				<Paper sx={{ flex: 1, p: 3 }} elevation={1}>
					<Outlet />
				</Paper>
			</Stack>
		</Container>
	)
}
