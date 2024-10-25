import { AdminPanelSettings, Home } from '@mui/icons-material'
import { Button, Stack } from '@mui/material'

import { appRoutes } from '../../../../../router/routes/appRoutes'
import { useRouter } from '../../../../../router/routes/routes'
import { BaseNavigator } from '../../../../components/BaseNavigator'

export const AdminNavigator = () => {
	const { navigateTo } = useRouter()

	const onHome = () => {
		navigateTo({ target: appRoutes.home })
	}

	return (
		<BaseNavigator>
			<Stack direction="row" height="100%" gap={1}>
				<Button onClick={onHome} sx={{ gap: 0.5 }}>
					<Home /> Home
				</Button>
				<Button sx={{ gap: 0.5 }} variant="contained">
					<AdminPanelSettings /> Admin
				</Button>
			</Stack>
		</BaseNavigator>
	)
}
