import AccountCircle from '@mui/icons-material/AccountCircle'
import Logout from '@mui/icons-material/Logout'
import Storage from '@mui/icons-material/Storage'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { useNavigate } from '@tanstack/react-router'
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { useDispatch } from 'react-redux'

import { usePostLogoutMutation } from '@/api/authApi'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { authSlice, User } from '../../AuthSlice'

type Props = {
	user: User
}

export function UserDropdown({ user }: Props) {
	const navigate = useNavigate()

	const [logout, { isLoading }] = usePostLogoutMutation()
	const { clearUser } = authSlice.actions
	const dispatch = useDispatch()

	const onLogout = async () => {
		const { error } = parseApiResponse(await logout())
		if (error) {
			return
		}
		dispatch(clearUser())
		navigate({ to: '/login' })
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
				<MenuItem onClick={() => navigate({ to: '/profile' })}>
					<ListItemIcon>
						<AccountCircle />
					</ListItemIcon>
					Profile
				</MenuItem>
				<MenuItem onClick={() => navigate({ to: '/profile/storage' })}>
					<ListItemIcon>
						<Storage />
					</ListItemIcon>
					Storage
				</MenuItem>
				<Divider />
				<MenuItem onClick={onLogout}>
					<ListItemIcon>
						<Logout />
					</ListItemIcon>
					Logout
				</MenuItem>
			</Menu>
		</Stack>
	)
}
