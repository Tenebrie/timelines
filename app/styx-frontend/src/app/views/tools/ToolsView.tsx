import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Outlet } from '@tanstack/react-router'

import { ToolButton } from './components/ToolButton'

export function ToolsView() {
	return (
		<Container maxWidth="lg" sx={{ py: 4, height: '100%' }}>
			<Stack direction="row" spacing={3}>
				<Stack>
					{/* Sidebar */}
					<Paper sx={{ width: 250, p: 2 }} elevation={1}>
						<Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
							Tools
						</Typography>
						<Stack spacing={1}>
							<ToolButton label="Image converter" route="/tools/image-converter" />
							<ToolButton label="QR generator" route="/tools/qr-generator" />
						</Stack>
					</Paper>
				</Stack>
				{/* Main Content */}
				<Paper sx={{ flex: 1, p: 3 }} elevation={1}>
					<Outlet />
				</Paper>
			</Stack>
		</Container>
	)
}
