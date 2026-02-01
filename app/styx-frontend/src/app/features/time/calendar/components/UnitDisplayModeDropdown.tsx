import { CalendarUnitDisplayType } from '@api/types/calendarTypes'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

type Props = {
	value: CalendarUnitDisplayType
	onChange: (value: CalendarUnitDisplayType) => void
}

export function UnitDisplayModeDropdown({ value, onChange }: Props) {
	// const { data: availableDisplayModes } = useListCalendarUnitDisplayFormatsQuery()

	// export type ListCalendarUnitDisplayFormatsApiResponse = /** status 200  */ (
	// 	| 'Name'
	// 	| 'NameOneIndexed'
	// 	| 'Numeric'
	// 	| 'NumericOneIndexed'
	// 	| 'Hidden'
	// )[]

	const formatDefinitions: Record<
		CalendarUnitDisplayType,
		{ id: CalendarUnitDisplayType; name: string; description: string }
	> = {
		Name: {
			id: 'Name',
			name: 'Name',
			description: 'Show unit by name',
		},
		NameOneIndexed: {
			id: 'NameOneIndexed',
			name: 'Name (One Indexed)',
			description: 'Show unit by name (one indexed)',
		},
		Numeric: {
			id: 'Numeric',
			name: 'Numeric',
			description: 'Show unit as numeric',
		},
		NumericOneIndexed: {
			id: 'NumericOneIndexed',
			name: 'Numeric (One Indexed)',
			description: 'Show unit as numeric (one indexed)',
		},
		Hidden: {
			id: 'Hidden',
			name: 'Hidden',
			description: 'Hide unit',
		},
	}
	const formats = Object.values(formatDefinitions)

	// const formats = useMemo(() => {
	// 	return availableDisplayModes?.map((mode) => ({
	// 		id: mode,
	// 		name: mode,
	// 		description: mode,
	// 	}))
	// }, [availableDisplayModes])

	if (!formats) {
		return null
	}

	return (
		<FormControl>
			<InputLabel>Unit mode</InputLabel>
			<Select
				label="Unit mode"
				size="small"
				value={value}
				onChange={(e) => {
					onChange(e.target.value)
				}}
				renderValue={(value) => <div>{formatDefinitions[value]?.name}</div>}
				sx={{ minWidth: 150 }}
			>
				{formats.map((u) => (
					<MenuItem key={u.id} value={u.id}>
						<ListItemText primary={u.name} secondary={u.description} />
					</MenuItem>
				))}
			</Select>
		</FormControl>
	)
}
