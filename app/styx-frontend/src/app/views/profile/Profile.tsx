import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Outlet } from '@tanstack/react-router'

import { PageButton } from './components/PageButton'

export function Profile() {
	return (
		<Container maxWidth="lg" sx={{ py: 4, height: '100%' }}>
			<Stack direction="row" spacing={3} paddingBottom={3}>
				{/* Sidebar */}
				<Paper
					sx={{
						position: 'sticky',
						width: 250,
						p: 2,
						top: 16,
						display: 'flex',
						flexDirection: 'column',
						height: '100%',
					}}
					elevation={1}
				>
					<Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
						Settings
					</Typography>
					<Stack spacing={1}>
						<PageButton label="Public profile" route="/profile/public" />
						<PageButton label="Storage" route="/profile/storage" />
					</Stack>

					{/* Version marker */}
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ mt: 'auto', pt: 4, display: 'block', textAlign: 'center', opacity: 0.6 }}
					>
						Build <b>{__APP_VERSION__}</b> <b>({new Date(__BUILD_TIME__).toLocaleString('sv-SE')})</b>
					</Typography>
				</Paper>

				{/* Main Content */}
				<Paper sx={{ flex: 1, p: 3 }} elevation={1}>
					<Outlet />
				</Paper>
			</Stack>
		</Container>
	)
}
