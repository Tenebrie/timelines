import { useListCalendarsQuery, useListWorldCalendarsQuery } from '@api/calendarApi'
import { useListCalendarTemplatesQuery } from '@api/otherApi'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
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

	const emptyOption = useMemo(() => ({ id: '[empty]', name: 'Empty' }), [])

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
				{allowEmpty && (
					<MenuItem key={emptyOption.id} value={emptyOption.id}>
						{emptyOption.name}
					</MenuItem>
				)}
				{userDefinedTemplates.length > 0 && allowEmpty && <Divider />}
				{userDefinedTemplates.length > 0 && <StyledListHeader>Your Templates</StyledListHeader>}
				{userDefinedTemplates.map((option) => (
					<MenuItem key={option.id} value={option.id}>
						{option.name}
					</MenuItem>
				))}
				{currentWorldCalendars.length > 0 && <Divider />}
				{currentWorldCalendars.length > 0 && <StyledListHeader>World</StyledListHeader>}
				{currentWorldCalendars.map((option) => (
					<MenuItem key={option.id} value={option.id}>
						{option.name}
					</MenuItem>
				))}
				{templateCalendars.length > 0 && <Divider />}
				{templateCalendars.length > 0 && <StyledListHeader>Built-In Templates</StyledListHeader>}
				{templateCalendars.map((option) => (
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

export function useTemplateCalendars() {
	const { data: templateCalendars } = useListCalendarTemplatesQuery()
	const data = useMemo(() => {
		if (!templateCalendars) {
			return []
		}
		return templateCalendars?.map((calendar) => ({
			id: calendar,
			name: calendar as string,
		}))
	}, [templateCalendars])
	return data
}
