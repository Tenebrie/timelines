import Login from '@mui/icons-material/Login'
import PersonAdd from '@mui/icons-material/PersonAdd'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { useNavigate } from '@tanstack/react-router'
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'

import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

export function GuestDropdown() {
	const navigate = useNavigate()
	const popupState = usePopupState({ variant: 'popover', popupId: 'profile-menu' })
	const isLogin = useCheckRouteMatch('/login')
	const isRegister = useCheckRouteMatch('/register')

	const onLogin = async () => {
		navigate({ to: '/login' })
		popupState.close()
	}

	const onRegister = async () => {
		navigate({ to: '/register' })
		popupState.close()
	}

	return (
		<Stack direction="row" alignItems="center" spacing={1}>
			<Button
				startIcon={<Avatar sx={{ height: 32, width: 32 }} />}
				{...bindTrigger(popupState)}
				sx={{ padding: '5px 15px' }}
			>
				Anonymous
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
				<MenuItem disabled>Anonymous User</MenuItem>
				<Divider />
				<MenuItem onClick={onLogin} selected={isLogin}>
					<ListItemIcon>
						<Login />
					</ListItemIcon>
					Login
				</MenuItem>
				<MenuItem onClick={onRegister} selected={isRegister}>
					<ListItemIcon>
						<PersonAdd />
					</ListItemIcon>
					Register
				</MenuItem>
			</Menu>
		</Stack>
	)
}
