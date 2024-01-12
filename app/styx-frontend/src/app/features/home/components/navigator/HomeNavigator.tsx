import { AdminPanelSettings, Home } from '@mui/icons-material'
import { Button, Stack } from '@mui/material'
import { useSelector } from 'react-redux'

import { useRouter } from '../../../../../router/routes/routes'
import { BaseNavigator } from '../../../../components/BaseNavigator'
import { getAuthState } from '../../../auth/selectors'

export const HomeNavigator = () => {
	const { navigateTo } = useRouter()

	const { user } = useSelector(getAuthState)

	const onAdmin = () => {
		navigateTo({ target: '/admin' })
	}

	return (
		<BaseNavigator>
			<Stack direction="row" height="100%" gap={1}>
				<Button sx={{ gap: 0.5 }} variant="contained">
					<Home /> Home
				</Button>
				{user?.level === 'Admin' && (
					<Button onClick={onAdmin} sx={{ gap: 0.5 }}>
						<AdminPanelSettings /> Admin
					</Button>
				)}
			</Stack>
		</BaseNavigator>
	)
}
