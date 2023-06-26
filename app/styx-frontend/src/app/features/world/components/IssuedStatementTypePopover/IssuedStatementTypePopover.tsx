import { Person, Public } from '@mui/icons-material'
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { bindMenu, PopupState } from 'material-ui-popup-state/hooks'
import { useDispatch } from 'react-redux'

import { worldSlice } from '../../reducer'

type Props = {
	state: PopupState
	eventId: string
}

export const StatementTypePopover = ({ state, eventId }: Props) => {
	const dispatch = useDispatch()
	const { openEventWizard } = worldSlice.actions

	const onWorldStatement = () => {
		state.close()
		dispatch(openEventWizard({ timestamp: 0 }))
	}

	const onActorStatement = () => {
		state.close()
		dispatch(openEventWizard({ timestamp: 0 }))
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
			<MenuItem onClick={onWorldStatement}>
				<ListItemIcon>
					<Public />
				</ListItemIcon>
				<ListItemText primary="World Statement" secondary="Revokable change of world state" />
			</MenuItem>
			<Divider />
			<MenuItem onClick={onActorStatement}>
				<ListItemIcon>
					<Person />
				</ListItemIcon>
				<ListItemText primary="Actor Statement" secondary="Revokable change of an actor's state" />
			</MenuItem>
		</Menu>
	)
}
