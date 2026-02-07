import { useUpdateCalendarPresentationMutation } from '@api/calendarApi'
import { CalendarDraftPresentation, CalendarDraftUnit } from '@api/types/calendarTypes'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'
import { CalendarPresentationTitle } from '../components/CalendarPresentationTitle'

type Props = {
	presentation: CalendarDraftPresentation
	onClose: () => void
}

export function CalendarPresentationEditorPanel({ presentation, onClose }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)
	const [updatePresentation] = useUpdateCalendarPresentationMutation()

	// Local state for editing
	const [localUnits, setLocalUnits] = useState<{ unitId: string; formatString: string }[]>(
		presentation.units.map((u) => ({ unitId: u.unitId, formatString: u.formatString })),
	)

	useEffect(() => {
		setLocalUnits(presentation.units.map((u) => ({ unitId: u.unitId, formatString: u.formatString })))
	}, [presentation.units])

	// Get deduplicated visible units (by display name)
	const availableUnits = useMemo(() => {
		if (!calendar) return []
		const seenDisplayNames = new Set<string>()
		const units: CalendarDraftUnit[] = []

		// Filter only visible units (formatMode !== 'Hidden')
		const visibleUnits = calendar.units.filter((u) => u.formatMode !== 'Hidden')

		for (const unit of visibleUnits) {
			const displayName = unit.displayName || unit.name
			if (!seenDisplayNames.has(displayName.toLowerCase())) {
				seenDisplayNames.add(displayName.toLowerCase())
				units.push(unit)
			}
		}
		return units
	}, [calendar])

	// Get units not yet added to the presentation
	const unitsNotInPresentation = useMemo(() => {
		const addedUnitIds = new Set(localUnits.map((u) => u.unitId))
		return availableUnits.filter((u) => !addedUnitIds.has(u.id))
	}, [availableUnits, localUnits])

	const saveUnits = async (newUnits: { unitId: string; formatString: string }[]) => {
		if (!calendar) return
		await updatePresentation({
			calendarId: calendar.id,
			presentationId: presentation.id,
			body: {
				units: newUnits,
			},
		})
	}

	const handleAddUnit = async (unit: CalendarDraftUnit) => {
		const newUnits = [...localUnits, { unitId: unit.id, formatString: '' }]
		// Sort by duration (descending)
		const sorted = sortUnitsByDuration(newUnits)
		setLocalUnits(sorted)
		await saveUnits(sorted)
	}

	const handleRemoveUnit = async (unitId: string) => {
		const newUnits = localUnits.filter((u) => u.unitId !== unitId)
		setLocalUnits(newUnits)
		await saveUnits(newUnits)
	}

	const handleFormatStringChange = (unitId: string, formatString: string) => {
		const newUnits = localUnits.map((u) => (u.unitId === unitId ? { ...u, formatString } : u))
		setLocalUnits(newUnits)
	}

	const handleFormatStringBlur = async () => {
		await saveUnits(localUnits)
	}

	const sortUnitsByDuration = (units: { unitId: string; formatString: string }[]) => {
		if (!calendar) return units
		return [...units].sort((a, b) => {
			const unitA = calendar.units.find((u) => u.id === a.unitId)
			const unitB = calendar.units.find((u) => u.id === b.unitId)
			const durationA = unitA?.duration ?? 0
			const durationB = unitB?.duration ?? 0
			return durationB - durationA
		})
	}

	const getUnitById = (unitId: string) => {
		return calendar?.units.find((u) => u.id === unitId)
	}

	if (!calendar) {
		return null
	}

	return (
		<Stack gap={1}>
			<CalendarPresentationTitle presentation={presentation} onClose={onClose} />
			<Divider />

			<Stack sx={{ p: '0 8px' }}>
				<Typography variant="subtitle2" sx={{ mt: 1 }}>
					Units
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
					Add time units to display on timeline pips at this zoom level. The format string controls how the
					value is shown (e.g., &quot;YYYY&quot; for year, &quot;DD-MM&quot; for day-month).
				</Typography>

				<Stack gap={1}>
					{localUnits.map((localUnit) => {
						const unit = getUnitById(localUnit.unitId)
						if (!unit) return null
						return (
							<Stack
								key={localUnit.unitId}
								direction="row"
								alignItems="center"
								gap={1}
								sx={{
									p: 1,
									borderRadius: 1,
									bgcolor: 'action.hover',
								}}
							>
								<Typography variant="body2" sx={{ minWidth: 100, textTransform: 'capitalize' }}>
									{unit.displayName || unit.name}
								</Typography>
								<TextField
									size="small"
									value={localUnit.formatString}
									onChange={(e) => handleFormatStringChange(localUnit.unitId, e.target.value)}
									onBlur={handleFormatStringBlur}
									placeholder="Format string"
									sx={{ flex: 1 }}
								/>
								<Tooltip title="Remove">
									<IconButton size="small" onClick={() => handleRemoveUnit(localUnit.unitId)}>
										<Delete fontSize="small" />
									</IconButton>
								</Tooltip>
							</Stack>
						)
					})}
				</Stack>

				{unitsNotInPresentation.length > 0 && (
					<Box sx={{ mt: 1 }}>
						<Autocomplete
							options={unitsNotInPresentation}
							getOptionLabel={(option) => {
								const name = option.displayName || option.name
								return name.charAt(0).toUpperCase() + name.slice(1)
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									size="small"
									placeholder="Add unit..."
									InputProps={{
										...params.InputProps,
										startAdornment: <Add fontSize="small" sx={{ ml: 1, mr: 0.5, color: 'text.secondary' }} />,
									}}
								/>
							)}
							onChange={(_, value) => {
								if (value) {
									handleAddUnit(value)
								}
							}}
							value={null}
							blurOnSelect
							clearOnBlur
						/>
					</Box>
				)}

				{localUnits.length === 0 && unitsNotInPresentation.length === 0 && (
					<Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
						No visible units available. Create some units in the Time Units tab first, and make sure they are
						not hidden.
					</Typography>
				)}
			</Stack>
		</Stack>
	)
}
