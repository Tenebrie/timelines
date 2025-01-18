import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings'
import Home from '@mui/icons-material/Home'
import Speed from '@mui/icons-material/Speed'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { ReactElement, useMemo } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { CustomTheme, useCustomTheme } from '../../hooks/useCustomTheme'
import { appRoutes } from '../../router/routes/appRoutes'
import { adminRoutes } from '../../router/routes/featureRoutes/adminRoutes'
import { useRouter } from '../../router/routes/routes'
import { Announcements } from '../features/announcements/Announcements'
import { getAuthState } from '../features/auth/selectors'
import { SmallProfile } from '../features/auth/smallProfile/SmallProfile'
import { PerformanceMetrics } from '../features/profiling/PerformanceMetrics'
import { ThemeModeToggle } from '../features/theming/ThemeModeToggle'
import { isDev } from '../utils/isDev'

const Container = styled.div<{ $theme: CustomTheme }>`
	width: calc(100% - 16px);
	background: ${(props) => props.$theme.custom.palette.background.navigator};
	box-shadow: 0 4px 2px -2px ${(props) => props.$theme.custom.palette.background.navigator};
	display: flex;
	justify-content: space-between;
	z-index: 2;
	padding: 4px 8px;
`

type Props = {
	children?: ReactElement | ReactElement[]
}

export const BaseNavigator = ({ children }: Props) => {
	const { navigateTo, isLocationEqual } = useRouter()
	const { user } = useSelector(getAuthState)
	const theme = useCustomTheme()

	const onHome = () => {
		navigateTo({ target: appRoutes.home })
	}

	const onAdmin = () => {
		navigateTo({ target: adminRoutes.adminRoot })
	}

	const onProfile = () => {
		const values = Object.values(PerformanceMetrics.components).sort(
			(a, b) => b.totalActualDuration - a.totalActualDuration,
		)
		console.info(values)
	}

	const isHome = useMemo(() => isLocationEqual(appRoutes.home), [isLocationEqual])
	const isAdmin = useMemo(() => isLocationEqual(adminRoutes.adminRoot), [isLocationEqual])

	return (
		<Container $theme={theme}>
			<div>
				<Stack direction="row" height="100%" gap={1} alignItems="center">
					<Stack minWidth={173} direction="row" gap={1}>
						{children}
					</Stack>
					<Divider orientation="vertical" />
					<Button
						aria-label="Home"
						onClick={onHome}
						variant={isHome ? 'contained' : 'text'}
						sx={{
							gap: 0.5,
							border: '1px solid transparent',
							padding: '8px 15px',
						}}
					>
						<Home /> Home
					</Button>
					{user?.level === 'Admin' && (
						<Button
							aria-label="Admin"
							onClick={onAdmin}
							variant={isAdmin ? 'contained' : 'text'}
							sx={{
								gap: 0.5,
								border: '1px solid transparent',
								padding: '8px 15px',
							}}
						>
							<AdminPanelSettings /> Admin
						</Button>
					)}
					{user?.level === 'Admin' && isDev && (
						<Button
							aria-label="Profiler"
							onClick={onProfile}
							sx={{
								gap: 0.5,
								border: '1px solid transparent',
								padding: '8px 15px',
							}}
						>
							<Speed /> Profiler
						</Button>
					)}
				</Stack>
			</div>
			<Stack direction="row" gap={2} alignItems="center">
				<ThemeModeToggle />
				<Announcements />
				<Divider orientation="vertical" sx={{ height: '60%' }} />
				<SmallProfile />
			</Stack>
		</Container>
	)
}
