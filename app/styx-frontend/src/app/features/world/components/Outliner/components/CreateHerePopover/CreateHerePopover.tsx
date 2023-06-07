import { Person, Public } from '@mui/icons-material'
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { bindMenu, PopupState } from 'material-ui-popup-state/hooks'
import { useDispatch } from 'react-redux'

import { worldSlice } from '../../../../reducer'

type Props = {
	state: PopupState
	timestamp: number
}

export const CreateHerePopover = ({ state, timestamp }: Props) => {
	const dispatch = useDispatch()
	const { openEventWizard, openActorWizard } = worldSlice.actions

	const onCreateEvent = () => {
		state.close()
		dispatch(openEventWizard({ timestamp }))
	}

	const onCreateActor = () => {
		state.close()
		dispatch(openActorWizard())
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
