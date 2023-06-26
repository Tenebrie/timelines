import { ListItemText, MenuItem } from '@mui/material'
import List from '@mui/material/List'
import Popover from '@mui/material/Popover'
import { bindPopover, PopupState } from 'material-ui-popup-state/hooks'

import { WorldEventModule } from '../../../../types'

type Props = {
	popupState: PopupState
	modules: WorldEventModule[]
	onChange: (modules: WorldEventModule[]) => void
}

export const NewEventFieldPopup = ({ popupState, modules, onChange }: Props) => {
	const options: { text: string; secondary: string; module: WorldEventModule }[] = [
		{
			text: 'Custom name',
			secondary: 'Change the default event name',
			module: 'CustomName',
		},
		{
			text: 'Revoked at',
			secondary: 'Specify the end-of-life timestamp for this event',
			module: 'RevokedAt',
		},
		{
			text: 'Icon',
			secondary: 'Choose a more interesting icon',
			module: 'EventIcon',
		},
		{
			text: 'Actors',
			secondary: 'Set the actors directly involved in this event',
			module: 'TargetActors',
		},
		{
			text: 'Mentioned actors',
			secondary: 'Set the actors mentioned in this event',
			module: 'MentionedActors',
		},
	]

	const visibleOptions = options.filter((option) => !modules.includes(option.module))

	const onAddModule = (newModule: WorldEventModule) => {
		onChange([...modules, newModule])
		popupState.close()
	}

	return (
		<Popover
			{...bindPopover(popupState)}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'center',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'center',
			}}
		>
			<List dense>
				{visibleOptions.map((option) => (
					<MenuItem key={option.module} onClick={() => onAddModule(option.module)}>
						<ListItemText primary={option.text} secondary={option.secondary} />
					</MenuItem>
				))}
			</List>
		</Popover>
	)
}
