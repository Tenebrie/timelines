import { GetWorldCollaboratorsApiResponse } from '@api/worldCollaboratorsApi'
import LoadingButton from '@mui/lab/LoadingButton'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'

import { useWorldCalendar } from '@/app/features/time/hooks/useWorldCalendar'
import { WorldBrief, WorldCalendarType } from '@/app/features/worldTimeline/types'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut'

import { WorldAccessModeDropdown } from './components/WorldAccessModeDropdown'
import { WorldCollaborators } from './components/WorldCollaborators'
import { useEditWorld } from './hooks/useEditWorld'
import { useWorldFields } from './hooks/useWorldFields'

type Props = {
	world: WorldBrief
	collaborators: GetWorldCollaboratorsApiResponse
}

export const WorldDetailsEditor = ({ world, collaborators }: Props) => {
	const { listAllCalendars } = useWorldCalendar()

	const state = useWorldFields({ world })
	const { name, description, calendar, setName, setDescription, setCalendar } = state
	const { isSaving, manualSave, autosaveIcon, autosaveColor } = useEditWorld({ world, state })

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		manualSave()
	})

	return (
		<Stack gap={2} marginTop={1}>
			<TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
			<TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
			<FormControl fullWidth>
				<InputLabel id="world-calendar-label">Calendar</InputLabel>
				<Select
					value={calendar}
					label="Calendar"
					labelId="world-calendar-label"
					onChange={(event) => setCalendar(event.target.value as WorldCalendarType)}
				>
					{listAllCalendars().map((option) => (
						<MenuItem key={option.id} value={option.id}>
							{option.displayName}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<Divider />
			<WorldAccessModeDropdown world={world} />
			<Divider />
			<WorldCollaborators worldId={world.id} collaborators={collaborators} />
			<Divider />
			<Stack direction="row" justifyContent="flex-end" gap={2}>
				<Tooltip title={shortcutLabel} arrow placement="top">
					<span>
						<LoadingButton
							loading={isSaving}
							variant="outlined"
							onClick={manualSave}
							loadingPosition="start"
							color={autosaveColor}
							startIcon={autosaveIcon}
						>
							Save
						</LoadingButton>
					</span>
				</Tooltip>
			</Stack>
		</Stack>
	)
}
