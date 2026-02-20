import { UpdateCalendarUnitApiArg } from '@api/calendarApi'
import { CalendarDraftUnit } from '@api/types/calendarTypes'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
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
import { useFormatTimestampUnits } from '../../hooks/useFormatTimestampUnits'
import { usePreviewCalendar } from '../../hooks/usePreviewCalendar'
import { useSelectedCalendarUnit } from '../../hooks/useSelectedCalendarUnit'
import { CalendarUnitEditorTab } from '../CalendarUnitEditor'
import {
	CalendarUnitFormatDefinitions,
	CalendarUnitFormatModeDropdown,
} from './CalendarUnitFormatModeDropdown'

type Props = {
	unit: CalendarDraftUnit
}

export function CalendarUnitFormat({ unit }: Props) {
	const [updateUnit] = useUpdateCalendarUnitDebounced()
	const previewCalendar = usePreviewCalendar()

	const [formatMode, setFormatMode] = useState(unit.formatMode)
	const [formatShorthand, setFormatShorthand] = useState<string>(unit.formatShorthand ?? '')

	useSelectedCalendarUnit({
		unit,
		onChange: (u) => {
			setFormatMode(u.formatMode)
			setFormatShorthand(u.formatShorthand ?? '')
		},
	})

	const onUpdateUnit = useEvent((body: UpdateCalendarUnitApiArg['body']) => {
		updateUnit({
			calendarId: unit.calendarId,
			unitId: unit.id,
			body,
		})
	})

	const previewUnits = useMemo(() => {
		if (!previewCalendar) {
			return []
		}
		const previewUnit = previewCalendar.units.find((u) => u.id === unit.id)
		if (!previewUnit) {
			return previewCalendar.units
		}
		return previewCalendar.units
			.filter((u) => u.formatShorthand !== formatShorthand && u.treeDepth > previewUnit.treeDepth)
			.concat({ ...previewUnit, formatShorthand: formatShorthand ?? '', parents: [] })
	}, [formatShorthand, previewCalendar, unit.id])

	const format = useFormatTimestampUnits({
		units: previewUnits,
		dateFormatString: (formatShorthand ?? '').repeat(2),
		originTime: previewCalendar ? Number(previewCalendar.originTime) : 0,
	})

	const tooltip = useMemo(() => {
		if (!previewCalendar) {
			return ''
		}
		const previewUnit = previewCalendar.units.find((u) => u.id === unit.id)
		if (!previewUnit) {
			return ''
		}
		if (previewUnit.formatMode === 'Hidden') {
			return 'Hidden'
		}
		if (!previewUnit.formatShorthand) {
			return 'No format shorthand set'
		}
		const formatName = CalendarUnitFormatDefinitions[previewUnit.formatMode]?.name || '???'
		return `Shorthand: "${previewUnit.formatShorthand}" | ${formatName}: ${format({ timestamp: 0 })}, ${format({ timestamp: Number(unit.duration) })}, ${format({ timestamp: Number(unit.duration) * 2 })}`
	}, [previewCalendar, format, unit.duration, unit.id])

	const { expandedUnitSections } = useSelector(
		getCalendarEditorPreferences,
		(a, b) =>
			a.expandedUnitSections.includes(CalendarUnitEditorTab.Formatting) ===
			b.expandedUnitSections.includes(CalendarUnitEditorTab.Formatting),
	)
	const { toggleExpandedCalendarUnitSection } = preferencesSlice.actions
	const dispatch = useDispatch()

	return (
		<Accordion
			expanded={expandedUnitSections.includes(CalendarUnitEditorTab.Formatting)}
			onChange={() => dispatch(toggleExpandedCalendarUnitSection(CalendarUnitEditorTab.Formatting))}
		>
			<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header">
				<Typography component="span" sx={{ width: '33%', flexShrink: 0 }}>
					Formatting
				</Typography>
				<Typography component="span" sx={{ color: 'text.secondary' }}>
					{tooltip}
				</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Stack gap={2}>
					<Stack sx={{ opacity: 0.5 }}>
						<Typography variant="subtitle2">Timestamp formatting</Typography>
						<Typography variant="body2" color="text.secondary">
							Specify this unit&apos;s shorthand letter that is used to reference it, and its behaviour when
							formatting timestamps. Hidden units will never be shown in formatted dates.
						</Typography>
					</Stack>
					<Divider />
					<Stack gap={1} flexDirection="row">
						<TextField
							label="Shorthand"
							size="small"
							slotProps={{
								htmlInput: {
									maxLength: 1,
								},
							}}
							value={formatShorthand}
							onChange={(e) => {
								setFormatShorthand(e.target.value)
								onUpdateUnit({ formatShorthand: e.target.value })
							}}
							sx={{ width: 100 }}
						/>
						<Box sx={{ flex: 1 }}>
							<CalendarUnitFormatModeDropdown
								value={formatMode}
								onChange={(value) => {
									setFormatMode(value)
									onUpdateUnit({ formatMode: value })
								}}
							/>
						</Box>
					</Stack>
				</Stack>
			</AccordionDetails>
		</Accordion>
	)
}
