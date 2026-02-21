import { UpdateCalendarPresentationApiArg, useUpdateCalendarPresentationMutation } from '@api/calendarApi'
import {
	CalendarDraftPresentation,
	CalendarDraftPresentationUnit,
	CalendarDraftUnit,
} from '@api/types/calendarTypes'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { useDebouncedState } from '@/app/hooks/useDebouncedState'
import { NewEntityAutocomplete } from '@/ui-lib/components/Autocomplete/NewEntityAutocomplete'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'
import { CalendarPresentationTitle } from '../components/CalendarPresentationTitle'
import { CalendarPresentationAddUnitForm } from './CalendarPresentationAddUnitForm'
import { CalendarPresentationPreview } from './CalendarPresentationPreview'
import { CalendarPresentationUnit } from './CalendarPresentationUnit'

type Props = {
	presentation: CalendarDraftPresentation
}

export type NewUnitData = NonNullable<UpdateCalendarPresentationApiArg['body']['units']>[number]

export function CalendarPresentationEditorPanel({ presentation }: Props) {
	const { calendar } = useSelector(getCalendarEditorState, (a, b) => a.calendar === b.calendar)
	const [updatePresentation] = useUpdateCalendarPresentationMutation()

	const [localUnits, setLocalUnits] = useState(
		presentation.units.map((unit) => ({
			...unit,
			backingUnit: calendar?.units.find((u) => u.id === unit.unitId),
		})),
	)

	const saveCompression = useCallback(
		(value: number) => {
			if (!calendar || isNaN(value) || value <= 0) {
				return
			}
			updatePresentation({
				calendarId: calendar.id,
				presentationId: presentation.id,
				body: { compression: value },
			})
		},
		[calendar, presentation.id, updatePresentation],
	)

	const [, localCompression, setLocalCompression, setLocalCompressionInstant] = useDebouncedState({
		initialValue: presentation.compression,
		onDebounce: saveCompression,
	})

	useEffect(() => {
		setLocalUnits(
			presentation.units.map((unit) => ({
				...unit,
				backingUnit: calendar?.units.find((u) => u.id === unit.unitId),
			})),
		)
		setLocalCompressionInstant(presentation.compression)
	}, [presentation.units, presentation.compression, setLocalCompressionInstant, calendar?.units])

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

	// Get units that can be used as baseline (smaller or equal to smallest unit in presentation)
	const baselineUnitOptions = useMemo(() => {
		if (!calendar || localUnits.length === 0) {
			return []
		}

		// Find the smallest unit's duration in this presentation
		const smallestDuration = Math.min(...localUnits.map((u) => Number(u.backingUnit?.duration)))

		// Return all units that have duration <= smallest duration
		return calendar.units.filter((u) => Number(u.duration) <= smallestDuration)
	}, [calendar, localUnits])

	// Get the currently selected baseline unit
	const selectedBaselineUnit = useMemo(() => {
		if (!presentation.baselineUnitId || !calendar) {
			return null
		}
		return calendar.units.find((u) => u.id === presentation.baselineUnitId) ?? null
	}, [calendar, presentation.baselineUnitId])

	const saveUnits = useCallback(
		async (units: CalendarDraftPresentationUnit[], addedUnits: NewUnitData[]) => {
			if (!calendar) {
				return
			}

			await updatePresentation({
				calendarId: calendar.id,
				presentationId: presentation.id,
				body: {
					units: units
						.map((u) => ({
							unitId: u.unitId,
							formatString: u.formatString,
							subdivision: u.subdivision,
							labeledIndices: u.labeledIndices,
						}))
						.concat(
							addedUnits.map((u) => ({
								unitId: u.unitId,
								formatString: u.formatString,
								subdivision: u.subdivision ?? 1,
								labeledIndices: u.labeledIndices ?? [],
							})),
						),
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
			const newUnits = localUnits.filter((u) => u.id !== unit.id)
			setLocalUnits(newUnits)
			saveUnits(newUnits, [])
		},
		[localUnits, saveUnits],
	)

	const handlePresentationUnitSave = useCallback(
		(unit: CalendarDraftPresentationUnit, value: Partial<CalendarDraftPresentationUnit>) => {
			const newUnits = localUnits.map((u) => (u.id === unit.id ? { ...u, ...value } : u))
			setLocalUnits(newUnits)
			saveUnits(newUnits, [])
		},
		[localUnits, saveUnits],
	)

	const handleCompressionChange = useCallback(
		(value: number) => {
			if (isNaN(value) || value <= 0) {
				setLocalCompressionInstant(presentation.compression)
				return
			}
			setLocalCompression(value)
		},
		[presentation.compression, setLocalCompression, setLocalCompressionInstant],
	)

	const handleBaselineUnitChange = useCallback(
		(unit: CalendarDraftUnit | null) => {
			if (!calendar) {
				return
			}
			updatePresentation({
				calendarId: calendar.id,
				presentationId: presentation.id,
				body: { baselineUnitId: unit?.id ?? null },
			})
		},
		[calendar, presentation.id, updatePresentation],
	)

	const sortedUnits = useMemo(() => {
		return localUnits
			.slice()
			.sort(
				(a, b) =>
					Number(b.backingUnit?.duration) * b.subdivision - Number(a.backingUnit?.duration) * a.subdivision,
			)
	}, [localUnits])

	if (!calendar) {
		return null
	}

	return (
		<Stack gap={1}>
			<CalendarPresentationTitle presentation={presentation} />
			<Divider />

			<Stack sx={{ p: '0 8px' }} gap={1}>
				<Stack sx={{ mt: 1, opacity: 0.5 }}>
					<Typography variant="subtitle2">Settings</Typography>
					<Typography variant="body2" color="text.secondary">
						Define the scale of this presentation level. A smallest timeline divider line will represent N
						baseline units. If unset, will use the size of the small divider.
					</Typography>
				</Stack>

				<Stack direction="row" gap={2} sx={{ mt: 1 }}>
					<TextField
						size="small"
						type="number"
						label="Step"
						value={localCompression}
						onChange={(e) => handleCompressionChange(Number(e.target.value))}
						sx={{ width: 120 }}
						slotProps={{ htmlInput: { min: 1, step: 1 } }}
					/>
					<NewEntityAutocomplete
						label="Baseline unit"
						options={baselineUnitOptions}
						value={selectedBaselineUnit}
						getOptionLabel={(u) => {
							return u.name.charAt(0).toUpperCase() + u.name.slice(1)
						}}
						sx={{ width: 350 }}
						onAdd={handleBaselineUnitChange}
					/>
				</Stack>

				<Divider sx={{ mt: 2 }} />

				<Stack sx={{ mt: 1, opacity: 0.5 }}>
					<Typography variant="subtitle2">Units</Typography>
					<Typography variant="body2" color="text.secondary">
						Define the timeline divider levels for this presentation. Every step of this unit will render a
						divider line with a given format.
						<br />
						Empty format is valid and will render a line without a label.
					</Typography>
				</Stack>

				<CalendarPresentationAddUnitForm
					limitReached={localUnits.length >= 3}
					options={availableUnits}
					onAddUnit={handleAddUnit}
				/>
				<Stack gap={1}>
					{sortedUnits.map((unit, index) => (
						<CalendarPresentationUnit
							key={unit.backingUnit!.id + index}
							index={index}
							layer={unit}
							onSave={(value) => handlePresentationUnitSave(unit, value)}
							onDelete={() => handleRemoveUnit(unit)}
						/>
					))}
				</Stack>

				{localUnits.length === 0 && availableUnits.length === 0 && (
					<Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
						No visible units available. Create some units in the Time Units tab first, and make sure they are
						not hidden.
					</Typography>
				)}

				<CalendarPresentationPreview presentation={presentation} />
			</Stack>
		</Stack>
	)
}
