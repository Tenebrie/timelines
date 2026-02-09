import { useListCalendarsQuery, useListWorldCalendarsQuery } from '@api/calendarApi'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import ListSubheader from '@mui/material/ListSubheader'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import styled from 'styled-components'

type Props = {
	worldId?: string
	value: string
	onChange: (value: string) => void
}

export function SettingsCalendarSelector({ worldId, value, onChange }: Props) {
	const { data: availableCalendars } = useListWorldCalendarsQuery(
		{ worldId: worldId ?? '' },
		{ skip: !worldId },
	)
	const { data: allCalendars } = useListCalendarsQuery(void 0, {
		skip: !!worldId,
	})

	const usedCalendars = allCalendars || availableCalendars

	const templateCalendars = usedCalendars?.filter((calendar) => calendar.ownerId) ?? []
	const worldCalendars = usedCalendars?.filter((calendar) => calendar.worldId === worldId) ?? []

	if (!usedCalendars) {
		return null
	}

	return (
		<FormControl fullWidth>
			<InputLabel id="world-calendar-label">Calendar</InputLabel>
			<Select
				value={value}
				renderValue={(id) => <span>{usedCalendars.find((option) => option.id === id)?.name}</span>}
				label="Calendar"
				labelId="world-calendar-label"
				onChange={(event) => onChange(event.target.value)}
			>
				<StyledListHeader>Templates</StyledListHeader>
				{templateCalendars.map((option) => (
					<MenuItem key={option.id} value={option.id}>
						{option.name}
					</MenuItem>
				))}
				<Divider />
				<StyledListHeader>World</StyledListHeader>
				{worldCalendars.map((option) => (
					<MenuItem key={option.id} value={option.id}>
						{option.name}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	)
}

const StyledListHeader = styled(ListSubheader)({
	backgroundImage: 'var(--Paper-overlay)',
})
