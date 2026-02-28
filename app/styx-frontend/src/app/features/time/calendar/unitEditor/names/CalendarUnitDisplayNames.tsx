import { UpdateCalendarUnitApiArg } from '@api/calendarApi'
import { CalendarDraftUnit } from '@api/types/calendarTypes'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { getCalendarEditorPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'

import { useUpdateCalendarUnitDebounced } from '../../api/useUpdateCalendarUnitDebounced'
import { usePreviewCalendar } from '../../hooks/usePreviewCalendar'
import { useSelectedCalendarUnit } from '../../hooks/useSelectedCalendarUnit'
import { CalendarUnitEditorTab } from '../CalendarUnitEditor'

type Props = {
	unit: CalendarDraftUnit
}

export function CalendarUnitDisplayNames({ unit }: Props) {
	const [updateUnit] = useUpdateCalendarUnitDebounced()
	const previewCalendar = usePreviewCalendar()

	const [displayName, setDisplayName] = useState(unit.displayName ?? '')
	const [displayNamePlural, setDisplayNamePlural] = useState(unit.displayNamePlural ?? '')
	const [displayNameShort, setDisplayNameShort] = useState(unit.displayNameShort ?? '')

	const dispatch = useDispatch()

	useSelectedCalendarUnit({
		unit,
		onChange: (u) => {
			setDisplayName(u.displayName ?? '')
			setDisplayNamePlural(u.displayNamePlural ?? '')
			setDisplayNameShort(u.displayNameShort ?? '')
		},
	})

	const onUpdateUnit = useEvent((body: UpdateCalendarUnitApiArg['body']) => {
		updateUnit({
			calendarId: unit.calendarId,
			unitId: unit.id,
			body,
		})
	})

	const namePreview = useMemo(() => {
		const previewUnit = previewCalendar?.units.find((u) => u.id === unit.id) || null
		if (!previewCalendar || !previewUnit) {
			return {
				single: '',
				plural: '',
				short: '',
			}
		}

		return {
			single: previewUnit.displayName,
			plural: previewUnit.displayNamePlural,
			short: previewUnit.displayNameShort,
		}
	}, [previewCalendar, unit.id])

	const { expandedUnitSections } = useSelector(
		getCalendarEditorPreferences,
		(a, b) =>
			a.expandedUnitSections.includes(CalendarUnitEditorTab.Names) ===
			b.expandedUnitSections.includes(CalendarUnitEditorTab.Names),
	)
	const { toggleExpandedCalendarUnitSection } = preferencesSlice.actions

	return (
		<Accordion
			expanded={expandedUnitSections.includes(CalendarUnitEditorTab.Names)}
			onChange={() => dispatch(toggleExpandedCalendarUnitSection(CalendarUnitEditorTab.Names))}
		>
			<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header">
				<Typography component="span" sx={{ width: '33%', flexShrink: 0 }}>
					Display names
				</Typography>
				<Typography component="span" sx={{ color: 'text.secondary' }}>
					One {namePreview.single}; many {namePreview.plural}; in short &#39;{namePreview.short}&#39;
				</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Stack gap={2}>
					<Stack sx={{ opacity: 0.5 }}>
						<Typography variant="subtitle2">Unit names</Typography>
						<Typography variant="body2" color="text.secondary">
							Defines the names this unit is formatted with as part of a time string.
						</Typography>
					</Stack>
					<Divider />
					<TextField
						label="Display Name"
						size="small"
						variant="outlined"
						placeholder={unit.name}
						value={displayName}
						onChange={(e) => {
							setDisplayName(e.target.value)
							onUpdateUnit({ displayName: e.target.value })
						}}
						helperText={<b>Units with the same display names are counted together.</b>}
					/>
					<TextField
						label="Display Name (Plural)"
						size="small"
						placeholder={unit.name + 's'}
						value={displayNamePlural}
						onChange={(e) => {
							setDisplayNamePlural(e.target.value)
							onUpdateUnit({ displayNamePlural: e.target.value })
						}}
					/>
					<TextField
						label="Display Name (Short)"
						size="small"
						placeholder={unit.name.substring(0, 3).trim()}
						value={displayNameShort}
						onChange={(e) => {
							setDisplayNameShort(e.target.value)
							onUpdateUnit({ displayNameShort: e.target.value })
						}}
					/>
				</Stack>
			</AccordionDetails>
		</Accordion>
	)
}
