import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'

export function SlowAuthDropdown() {
	const popupState = usePopupState({ variant: 'popover', popupId: 'profile-menu' })

	return (
		<Stack direction="row" alignItems="center" spacing={1}>
			<Button
				startIcon={<Skeleton variant="circular" width={32} height={32} />}
				sx={{ padding: '5px 15px' }}
				{...bindTrigger(popupState)}
			>
				<Skeleton variant="text" width={100} height={20} />
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
				<MenuItem disabled>Authentication is taking a moment, please hold...</MenuItem>
			</Menu>
		</Stack>
	)
}
