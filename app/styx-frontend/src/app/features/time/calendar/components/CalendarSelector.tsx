import { useListCalendarsQuery, useListWorldCalendarsQuery } from '@api/calendarApi'
import { useListCalendarTemplatesQuery } from '@api/otherApi'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useMemo } from 'react'
import styled from 'styled-components'

type Props = {
	worldId?: string
	label?: string
} & (
	| {
			value: string
			onChange: (value: string) => void
			allowEmpty?: false
	  }
	| {
			value: string | undefined
			onChange: (value: string | undefined) => void
			allowEmpty: true
	  }
)

export function CalendarSelector({ worldId, label, value, onChange, allowEmpty }: Props) {
	const { data: worldCalendars } = useListWorldCalendarsQuery({ worldId: worldId ?? '' }, { skip: !worldId })
	const { data: userCalendars } = useListCalendarsQuery(void 0, {
		skip: !!worldId,
	})
	const templateCalendars = useTemplateCalendars()

	const usedCalendars = userCalendars || worldCalendars

	const userDefinedTemplates = usedCalendars?.filter((calendar) => calendar.ownerId) ?? []
	const currentWorldCalendars = usedCalendars?.filter((calendar) => calendar.worldId === worldId) ?? []

	const emptyOption = useMemo(
		() => ({ id: '[empty]', name: 'Empty', description: 'Create a new one from scratch' }),
		[],
	)

	const allCalendars = useMemo(() => {
		const empty = allowEmpty ? [emptyOption] : []

		if (!usedCalendars) {
			return [...empty, ...templateCalendars]
		}

		return [...empty, ...usedCalendars, ...templateCalendars]
	}, [allowEmpty, emptyOption, templateCalendars, usedCalendars])

	if (!usedCalendars) {
		return null
	}

	const sectionDisplayData = [
		allowEmpty,
		userDefinedTemplates.length > 0,
		currentWorldCalendars.length > 0,
		templateCalendars.length > 0,
	]

	const showSection = (index: number) => {
		return sectionDisplayData[index]
	}

	const showDivider = (index: number) => {
		if (index === 0) {
			return sectionDisplayData.slice(0, index + 1).some(Boolean)
		}
		return sectionDisplayData[index] && sectionDisplayData.slice(0, index).some(Boolean)
	}

	return (
		<FormControl fullWidth>
			<InputLabel id="world-calendar-label">{label ?? 'Calendar'}</InputLabel>
			<Select
				value={value ?? emptyOption.id}
				renderValue={(id) => <span>{allCalendars.find((option) => option.id === id)?.name}</span>}
				label={label ?? 'Calendar'}
				labelId="world-calendar-label"
				onChange={(event) => {
					if (allowEmpty && event.target.value === emptyOption.id) {
						onChange(undefined)
					} else {
						onChange(event.target.value)
					}
				}}
			>
				{showSection(0) && (
					<MenuItem key={emptyOption.id} value={emptyOption.id}>
						<ListItemText primary={emptyOption.name} secondary={emptyOption.description} />
					</MenuItem>
				)}
				{showDivider(1) && <Divider />}
				{showSection(1) && <StyledListHeader>Your Templates</StyledListHeader>}
				{userDefinedTemplates.map((option) => (
					<MenuItem key={option.id} value={option.id}>
						<ListItemText primary={option.name} secondary={option.description} />
					</MenuItem>
				))}
				{showDivider(2) && <Divider />}
				{showSection(2) && <StyledListHeader>World</StyledListHeader>}
				{currentWorldCalendars.map((option) => (
					<MenuItem key={option.id} value={option.id}>
						<ListItemText primary={option.name} secondary={option.description} />
					</MenuItem>
				))}
				{showDivider(3) && <Divider />}
				{showSection(3) && <StyledListHeader>Built-In Templates</StyledListHeader>}
				{templateCalendars.map((option) => (
					<MenuItem key={option.id} value={option.id}>
						<ListItemText primary={option.name} secondary={option.description} />
					</MenuItem>
				))}
			</Select>
		</FormControl>
	)
}

const StyledListHeader = styled(ListSubheader)({
	backgroundImage: 'var(--Paper-overlay)',
})

export function useTemplateCalendars() {
	const { data: templateCalendars } = useListCalendarTemplatesQuery()

	const data = useMemo(() => {
		if (!templateCalendars) {
			return []
		}
		return templateCalendars.templates
	}, [templateCalendars])
	return data
}
