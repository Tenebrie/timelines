import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Outlet } from '@tanstack/react-router'
import { useSelector } from 'react-redux'

import { getAuthState } from '@/app/features/auth/AuthSliceSelectors'

import { ToolButton } from './components/ToolButton'

export function ToolsView() {
	const { user } = useSelector(getAuthState, (a, b) => a.user === b.user)

	const isPremium = user?.level === 'Premium' || user?.level === 'Admin'

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
							<ToolButton label="QR code generator" route="/tools/qr-generator" />
							{isPremium && <ToolButton label="AI image generator" route="/tools/image-generator" />}
						</Stack>
					</Paper>
				</Stack>
				{/* Main Content */}
				<Paper sx={{ flex: 1, minWidth: 0, p: 3 }} elevation={1}>
					<Outlet />
				</Paper>
			</Stack>
		</Container>
	)
}
