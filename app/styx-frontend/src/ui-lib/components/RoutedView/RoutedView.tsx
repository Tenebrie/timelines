import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Outlet } from '@tanstack/react-router'

import { FileRouteTypes } from '@/routeTree.gen'

import { RoutedViewButton } from './RoutedViewButton'

type Props = {
	label?: string
	routes: RouteItem[]
	footer?: React.ReactNode
}

export type RouteItem = {
	icon?: React.ReactNode
	label: string
	exact?: boolean
	path: FileRouteTypes['fullPaths']
	isRendered?: boolean
}

export function RoutedView({ label, routes, footer }: Props) {
	const theme = useTheme()
	const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

	return (
		<Container maxWidth="xl" sx={{ py: 4, height: '100%', ...(isSmallScreen ? { px: 0.5, py: 1 } : {}) }}>
			<Stack direction={isSmallScreen ? 'column' : 'row'} spacing={3} paddingBottom={3}>
				{/* Sidebar */}
				<Paper
					sx={{
						position: isSmallScreen ? 'static' : 'sticky',
						width: isSmallScreen ? 'calc(100% - 32px)' : 240,
						p: 2,
						top: 16,
						display: 'flex',
						flexDirection: 'column',
						height: '100%',
					}}
					elevation={1}
				>
					{label && (
						<Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
							{label}
						</Typography>
					)}
					<Stack gap={1} flexWrap="wrap">
						{routes
							.filter((route) => route.isRendered != false)
							.map((route) => (
								<RoutedViewButton key={route.path} route={route} />
							))}
					</Stack>

					{footer}
				</Paper>

				{/* Main Content */}
				<Paper sx={{ flex: 1, p: 3, minWidth: 0 }} elevation={1}>
					<Outlet />
				</Paper>
			</Stack>
		</Container>
	)
}
