import { Logout } from '@mui/icons-material'
import LoadingButton from '@mui/lab/LoadingButton'

import { usePostLogoutMutation } from '../../../../api/rheaApi'
import { parseApiResponse } from '../../../utils/parseApiResponse'
import { useAppRouter } from '../../world/router'

export const SmallProfile = () => {
	const { navigateToLogin } = useAppRouter()

	const [logout, { isLoading }] = usePostLogoutMutation()

	const onLogout = async () => {
		const { error } = parseApiResponse(await logout())
		if (error) {
			return
		}
		navigateToLogin()
	}

	return (
		<LoadingButton
			loading={isLoading}
			color="secondary"
			onClick={onLogout}
			loadingPosition="start"
			startIcon={<Logout />}
		>
			<span>Logout</span>
		</LoadingButton>
	)
}
