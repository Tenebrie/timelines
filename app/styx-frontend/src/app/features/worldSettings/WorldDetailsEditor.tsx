import { GetWorldCollaboratorsApiResponse } from '@api/worldCollaboratorsApi'
import { Button, Divider, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import { useCallback } from 'react'

import { useWorldCalendar } from '@/app/features/time/hooks/useWorldCalendar'
import { WorldBrief } from '@/app/features/worldTimeline/types'
import { useAppRouter } from '@/router/routes/appRoutes'

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
