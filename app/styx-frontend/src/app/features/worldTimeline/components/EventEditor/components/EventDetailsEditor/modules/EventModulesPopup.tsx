import List from '@mui/material/List'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Popover from '@mui/material/Popover'
import { bindPopover, PopupState } from 'material-ui-popup-state/hooks'

import { WorldEventModule } from '@/app/features/worldTimeline/types'

import { useEventModules } from '../hooks/useEventModules'

type Props = {
	mode: 'add' | 'remove'
	popupState: PopupState
	modules: WorldEventModule[]
	onAdd: (module: WorldEventModule) => void
	onRemove: (module: WorldEventModule) => void
}

export const EventModulesPopup = ({ mode, popupState, modules, onAdd, onRemove }: Props) => {
	const { options } = useEventModules()
	const visibleOptions = options.filter(
		(option) =>
			(mode === 'add' && !modules.includes(option.module)) ||
			(mode === 'remove' && modules.includes(option.module)),
	)

	const onClick = (module: WorldEventModule) => {
		if (mode === 'add') {
			onAdd(module)
		} else {
			onRemove(module)
		}
		if (visibleOptions.length === 1) {
			popupState.close()
		}
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
			sx={{ marginTop: 1 }}
			slotProps={{
				paper: { sx: { minWidth: 340 } },
			}}
			// PaperProps={{
			// 	style: { minWidth: 340 },
			// }}
		>
			<List>
				{visibleOptions.map((option) => (
					<MenuItem key={option.module} onClick={() => onClick(option.module)}>
						<ListItemText primary={option.text} secondary={option.secondary} />
					</MenuItem>
				))}
			</List>
		</Popover>
	)
}
