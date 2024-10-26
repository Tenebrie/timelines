import {
	Button,
	Divider,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from '@mui/material'
import { useCallback } from 'react'

import { GetWorldCollaboratorsApiResponse } from '../../../../../api/rheaApi'
import { useAppRouter } from '../../../../../router/routes/appRoutes'
import { useWorldCalendar } from '../../../time/hooks/useWorldCalendar'
import { WorldBrief } from '../../../world/types'
import { WorldAccessModeDropdown } from './components/WorldAccessModeDropdown'
import { WorldCollaborators } from './components/WorldCollaborators'

type Props = {
	world: WorldBrief
	collaborators: GetWorldCollaboratorsApiResponse
}

export const WorldDetailsEditor = ({ world, collaborators }: Props) => {
	const { navigateTo } = useAppRouter()
	const { listAllCalendars } = useWorldCalendar()

	const onClose = useCallback(() => {
		navigateTo({
			target: '/home',
		})
	}, [navigateTo])

	return (
		<Stack gap={2} marginTop={1}>
			<TextField label="Name" value={world.name} disabled />
			<FormControl fullWidth>
				<InputLabel id="world-calendar-label">Calendar</InputLabel>
				<Select value={world.calendar} label="Calendar" labelId="world-calendar-label" disabled>
					{listAllCalendars().map((option) => (
						<MenuItem key={option.id} value={option.id}>
							{option.displayName}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<Stack gap={1}>
				<Typography>
					Events: <b>{world.events.length}</b>
				</Typography>
				<Typography>
					Actors: <b>{world.actors.length}</b>
				</Typography>
			</Stack>
			<Divider />
			<WorldAccessModeDropdown world={world} />
			<Divider />
			<WorldCollaborators worldId={world.id} collaborators={collaborators} />
			<Divider />
			<Stack direction="row" justifyContent="flex-end" gap={2}>
				<Button onClick={onClose}>Close</Button>
				<Button variant="contained">Save</Button>
			</Stack>
		</Stack>
	)
}
