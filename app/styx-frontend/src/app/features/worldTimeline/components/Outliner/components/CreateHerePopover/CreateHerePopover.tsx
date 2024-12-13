import { Person, Public } from '@mui/icons-material'
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
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