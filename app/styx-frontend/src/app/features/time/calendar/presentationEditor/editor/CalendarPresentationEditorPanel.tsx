import { UpdateCalendarPresentationApiArg, useUpdateCalendarPresentationMutation } from '@api/calendarApi'
import {
	CalendarDraftPresentation,
	CalendarDraftPresentationUnit,
	CalendarDraftUnit,
} from '@api/types/calendarTypes'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'
import { CalendarPresentationTitle } from '../components/CalendarPresentationTitle'
import { CalendarPresentationAddUnitForm } from './CalendarPresentationAddUnitForm'
import { CalendarPresentationUnit } from './CalendarPresentationUnit'

type Props = {
	presentation: CalendarDraftPresentation
	onClose: () => void
}

export type NewUnitData = NonNullable<UpdateCalendarPresentationApiArg['body']['units']>[number]

export function CalendarPresentationEditorPanel({ presentation, onClose }: Props) {
	const { calendar } = useSelector(getCalendarEditorState, (a, b) => a.calendar === b.calendar)
	const [updatePresentation] = useUpdateCalendarPresentationMutation()

	const [localUnits, setLocalUnits] = useState(presentation.units)

	useEffect(() => {
		setLocalUnits(presentation.units)
	}, [presentation.units])

	// Get deduplicated visible units (by bucket)
	const availableUnits = useMemo(() => {
		if (!calendar) {
			return []
		}

		const units: CalendarDraftUnit[] = []
		const seenDisplayNames = new Set<string>()

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

	const saveUnits = useCallback(
		async (units: CalendarDraftPresentationUnit[], addedUnits: NewUnitData[]) => {
			if (!calendar) {
				return
			}

			await updatePresentation({
				calendarId: calendar.id,
				presentationId: presentation.id,
				body: {
					units: units.map((u) => ({ unitId: u.unitId, formatString: u.formatString })).concat(addedUnits),
				},
			})
		},
		[calendar, presentation.id, updatePresentation],
	)

	const handleAddUnit = useCallback(
		(unit: NewUnitData) => {
			if (!calendar) {
				return
			}
			saveUnits(localUnits, [unit])
		},
		[calendar, localUnits, saveUnits],
	)

	const handleRemoveUnit = useCallback(
		(unit: CalendarDraftPresentationUnit) => {
			const newUnits = localUnits.filter((u) => u.unitId !== unit.unitId)
			setLocalUnits(newUnits)
			saveUnits(newUnits, [])
		},
		[localUnits, saveUnits],
	)

	const handleFormatStringChange = useCallback(
		(unit: CalendarDraftPresentationUnit, value: string) => {
			const newUnits = localUnits.map((u) => (u.unitId === unit.unitId ? { ...u, formatString: value } : u))
			setLocalUnits(newUnits)
			saveUnits(newUnits, [])
		},
		[localUnits, saveUnits],
	)

	if (!calendar) {
		return null
	}

	return (
		<Stack gap={1}>
			<CalendarPresentationTitle presentation={presentation} onClose={onClose} />
			<Divider />

			<Stack sx={{ p: '0 8px' }} gap={1}>
				<Stack sx={{ mt: 1 }}>
					<Typography variant="subtitle2">Units</Typography>
					<Typography variant="body2" color="text.secondary">
						Add time units to display on timeline pips at this zoom level. The format string controls how the
						value is shown (e.g., &quot;YYYY&quot; for year, &quot;DD-MM&quot; for day-month).
					</Typography>
				</Stack>

				<CalendarPresentationAddUnitForm options={unitsNotInPresentation} onAddUnit={handleAddUnit} />
				<Stack gap={1}>
					{localUnits.map((unit) => (
						<CalendarPresentationUnit
							key={unit.unitId}
							layer={unit}
							onFormatStringChange={(value) => handleFormatStringChange(unit, value)}
							onDelete={() => handleRemoveUnit(unit)}
						/>
					))}
				</Stack>

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
