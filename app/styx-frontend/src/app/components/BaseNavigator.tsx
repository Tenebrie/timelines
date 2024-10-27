import { AdminPanelSettings, Home } from '@mui/icons-material'
import { Button, Divider, Stack, useTheme } from '@mui/material'
import React, { ReactElement, useMemo } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { adminRoutes } from '../../router/routes/adminRoutes'
import { appRoutes } from '../../router/routes/appRoutes'
import { useRouter } from '../../router/routes/routes'
import { Announcements } from '../features/announcements/Announcements'
import { getAuthState } from '../features/auth/selectors'
import { SmallProfile } from '../features/auth/smallProfile/SmallProfile'
import { ThemeModeToggle } from '../features/theming/ThemeModeToggle'

const Container = styled.div`
	width: calc(100% - 16px);
	background: ${(props) => (props.theme.palette.mode === 'light' ? '#c2e0ff' : '#07121e')};
	box-shadow: 0 4px 2px -2px ${(props) => (props.theme.palette.mode === 'light' ? '#d8d8d8' : '#214f81')};
	display: flex;
	justify-content: space-between;
	z-index: 2;
	padding: 4px 8px;
`

type Props = {
	children?: ReactElement | ReactElement[]
}

export const BaseNavigator = ({ children }: Props) => {
	const theme = useTheme()
	const { navigateTo, isLocationEqual } = useRouter()
	const { user } = useSelector(getAuthState)

	const onHome = () => {
		navigateTo({ target: appRoutes.home })
	}

	const onAdmin = () => {
		navigateTo({ target: adminRoutes.adminRoot })
	}

	const isHome = useMemo(() => isLocationEqual(appRoutes.home), [isLocationEqual])
	const isAdmin = useMemo(() => isLocationEqual(adminRoutes.adminRoot), [isLocationEqual])

	return (
		<Container theme={theme}>
			<div>
				<Stack direction="row" height="100%" gap={1} alignItems="center">
					<Stack minWidth={173} direction="row" gap={1}>
						{children}
					</Stack>
					<Divider orientation="vertical" />
					<Button
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
