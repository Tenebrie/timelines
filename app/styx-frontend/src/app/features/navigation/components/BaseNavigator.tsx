import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings'
import Construction from '@mui/icons-material/Construction'
import Home from '@mui/icons-material/Home'
import PublicIcon from '@mui/icons-material/Public'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { AnnouncementView } from '../../announcements/AnnouncementView'
import { getAuthState } from '../../auth/AuthSliceSelectors'
import { SmallProfile } from '../../auth/components/SmallProfile'
import { ThemeModeToggle } from '../../theming/components/ThemeModeToggle'
import { CustomTheme, useCustomTheme } from '../../theming/hooks/useCustomTheme'
import { LastWorldNavigatorButton } from './LastWorldNavigatorButton'
import { NavigatorButton } from './NavigatorButton'

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
	const { user } = useSelector(getAuthState)
	const theme = useCustomTheme()

	return (
		<Container $theme={theme}>
			<div>
				<Stack direction="row" height="100%" gap={1} alignItems="center">
					<Stack minWidth={173} direction="row" gap={1} sx={{ justifyContent: 'flex-end' }}>
						{children}
						<LastWorldNavigatorButton icon={<PublicIcon />} label="World" />
					</Stack>
					<Divider orientation="vertical" />
					<NavigatorButton route="/home" icon={<Home />} label="Home" />
					<NavigatorButton route="/tools" icon={<Construction />} label="Tools" />
					{user?.level === 'Admin' && (
						<NavigatorButton route="/admin" icon={<AdminPanelSettings />} label="Admin" />
					)}
				</Stack>
			</div>
			<Stack direction="row" gap={2} alignItems="center">
				<ThemeModeToggle />
				<AnnouncementView />
				<Divider orientation="vertical" sx={{ height: '60%' }} />
				<SmallProfile />
			</Stack>
		</Container>
	)
}
