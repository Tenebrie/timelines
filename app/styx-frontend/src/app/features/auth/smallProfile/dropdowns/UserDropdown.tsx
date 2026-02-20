import AccountCircle from '@mui/icons-material/AccountCircle'
import LockResetIcon from '@mui/icons-material/LockReset'
import Logout from '@mui/icons-material/Logout'
import Storage from '@mui/icons-material/Storage'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { useDispatch } from 'react-redux'

import { usePostLogoutMutation } from '@/api/authApi'
import { NavigationLink } from '@/app/components/NavigationLink'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { authSlice, User } from '../../AuthSlice'

type Props = {
	user: User
}

export function UserDropdown({ user }: Props) {
	const navigate = useStableNavigate()
	const isProfile = useCheckRouteMatch('/profile/public')
	const isStorage = useCheckRouteMatch('/profile/storage')
	const isSecurity = useCheckRouteMatch('/profile/security')

	const [logout] = usePostLogoutMutation()
	const { clearUser } = authSlice.actions
	const dispatch = useDispatch()

	const onLogout = async () => {
		dispatch(clearUser())
		navigate({ to: '/login' })
		parseApiResponse(await logout())
	}

	const popupState = usePopupState({ variant: 'popover', popupId: 'profile-menu' })

	return (
		<Stack direction="row" alignItems="center" spacing={1}>
			<Button
				startIcon={<Avatar sx={{ height: 32, width: 32 }} src={user.avatarUrl} />}
				{...bindTrigger(popupState)}
				sx={{ padding: '5px 15px' }}
			>
				{user.username}
			</Button>
			<Menu
				{...bindMenu(popupState)}
				sx={{
					'.MuiPaper-root': {
						minWidth: '250px',
					},
				}}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
			>
				<MenuItem disabled>Profile</MenuItem>
				<Divider />
				<NavigationLink to="/profile">
					<MenuItem
						onClick={() => {
							popupState.close()
						}}
						selected={isProfile}
					>
						<ListItemIcon>
							<AccountCircle />
						</ListItemIcon>
						Profile
					</MenuItem>
				</NavigationLink>
				<NavigationLink to="/profile/storage">
					<MenuItem
						onClick={() => {
							popupState.close()
						}}
						selected={isStorage}
					>
						<ListItemIcon>
							<Storage />
						</ListItemIcon>
						Storage
					</MenuItem>
				</NavigationLink>
				<NavigationLink to="/profile/security">
					<MenuItem
						onClick={() => {
							popupState.close()
						}}
						selected={isSecurity}
					>
						<ListItemIcon>
							<LockResetIcon />
						</ListItemIcon>
						Security
					</MenuItem>
				</NavigationLink>
				<Divider sx={{ my: 1 }} />
				<MenuItem
					onClick={() => {
						onLogout()
						popupState.close()
					}}
				>
					<ListItemIcon>
						<Logout />
					</ListItemIcon>
					Logout
				</MenuItem>
			</Menu>
		</Stack>
	)
}
