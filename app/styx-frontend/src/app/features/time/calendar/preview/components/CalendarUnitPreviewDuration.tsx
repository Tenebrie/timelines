import { useGetCalendarPreviewQuery } from '@api/calendarApi'
import { CalendarDraftUnit } from '@api/types/calendarTypes'
import Typography from '@mui/material/Typography'

type Props = {
	unit: CalendarDraftUnit
}

export function CalendarUnitPreviewDuration({ unit }: Props) {
	const { data: calendar } = useGetCalendarPreviewQuery({ calendarId: unit.calendarId })

	if (!calendar) {
		return null
	}

	const previewUnit = calendar.units.find((u) => u.id === unit.id)
	if (!previewUnit) {
		return null
	}

	const units = calendar.units
		.map((u) => {
			const value = unit.duration / u.duration
			const roundedValue = Math.round(value)
			const isApproximate = !Number.isInteger(value)
			return {
				id: u.id,
				name: roundedValue === 1 ? u.displayName : u.displayNamePlural,
				value: roundedValue,
				isApproximate,
				displayName: u.displayName,
				hash: `${roundedValue}-${u.displayName}-${isApproximate}`,
			}
		})
		.filter((u) => u.value >= 1 && u.id !== unit.id && u.displayName !== previewUnit.displayName)

	const deduplicatedUnits = units.filter((u, index, self) => {
		return index === self.findIndex((t) => t.hash === u.hash)
	})

	return (
		<Typography variant="body2" fontWeight="bold" component="div">
			A single {previewUnit.displayName} is equal to:
			{deduplicatedUnits.map((u) => (
				<Typography key={u.id} variant="body2" component="div" color="text.secondary">
					- {u.isApproximate ? 'About ' : ''}
					{u.value} {u.name}
				</Typography>
			))}
		</Typography>
	)
}
