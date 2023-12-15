import { FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'

import { GetWorldCollaboratorsApiResponse, GetWorldInfoApiResponse } from '../../../../../api/rheaApi'
import { useWorldCalendar } from '../../../time/hooks/useWorldCalendar'
import { WorldCollaborators } from './components/WorldCollaborators'

type Props = {
	world: GetWorldInfoApiResponse
	collaborators: GetWorldCollaboratorsApiResponse
}

export const WorldDetailsEditor = ({ world, collaborators }: Props) => {
	const { listAllCalendars } = useWorldCalendar()

	return (
		<Stack gap={2} minWidth={400}>
			<TextField label="World name" value={world.name} disabled />
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
			<Typography variant="h5">Stats</Typography>
			<Typography>
				Events: <b>{world.events.length}</b>
			</Typography>
			<Typography>
				Actors: <b>{world.actors.length}</b>
			</Typography>
			<Typography variant="h5">Collaborators</Typography>
			<WorldCollaborators worldId={world.id} collaborators={collaborators} />
		</Stack>
	)
}
