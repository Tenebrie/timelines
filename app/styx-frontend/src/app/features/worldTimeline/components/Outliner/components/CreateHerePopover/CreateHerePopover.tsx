import Person from '@mui/icons-material/Person'
import Public from '@mui/icons-material/Public'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { bindMenu, PopupState } from 'material-ui-popup-state/hooks'

import { useModal } from '@/app/features/modals/reducer'

type Props = {
	state: PopupState
	timestamp: number
}

export const CreateHerePopover = ({ state, timestamp }: Props) => {
	const { open: openActorWizard } = useModal('actorWizard')
	const { open: openEventWizard } = useModal('eventWizard')

	const onCreateEvent = () => {
		state.close()
		openEventWizard({ timestamp })
	}

	const onCreateActor = () => {
		state.close()
		openActorWizard({})
	}

	return (
		<Menu
			{...bindMenu(state)}
			MenuListProps={{ sx: { width: 300 } }}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'center',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'center',
			}}
		>
			<MenuItem onClick={onCreateEvent}>
				<ListItemIcon>
					<Public />
				</ListItemIcon>
				<ListItemText primary="Event" secondary="Where and when things happen" />
			</MenuItem>
			<Divider />
			<MenuItem onClick={onCreateActor}>
				<ListItemIcon>
					<Person />
				</ListItemIcon>
				<ListItemText primary="Actor" secondary="A character or other entity" />
			</MenuItem>
		</Menu>
	)
}
