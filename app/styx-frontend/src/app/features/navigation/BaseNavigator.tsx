import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings'
import Home from '@mui/icons-material/Home'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useNavigate } from '@tanstack/react-router'
import { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

import { Announcements } from '../announcements/Announcements'
import { getAuthState } from '../auth/selectors'
import { SmallProfile } from '../auth/smallProfile/SmallProfile'
import { ThemeModeToggle } from '../theming/ThemeModeToggle'
import { CustomTheme, useCustomTheme } from '../theming/useCustomTheme'

const Container = styled(Paper)<{ $theme: CustomTheme }>`
	width: calc(100% - 16px);
	background: ${(props) => props.$theme.custom.palette.background.navigator};
	box-shadow: 0 4px 2px -2px ${(props) => props.$theme.custom.palette.background.navigator};
	display: flex;
	justify-content: space-between;
	border-radius: 0 !important;
	z-index: 10;
	padding: 4px 8px;
`

type Props = {
	children?: ReactNode | ReactNode[]
}

export const BaseNavigator = ({ children }: Props) => {
	const navigate = useNavigate()
	const { user } = useSelector(getAuthState)
	const theme = useCustomTheme()

	const onHome = () => {
		navigate({ to: '/home' })
	}

	const onAdmin = () => {
		navigate({ to: '/admin' })
	}

	const isHome = useCheckRouteMatch('/home')
	const isAdmin = useCheckRouteMatch('/admin')

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
