import { CalendarDraftUnit } from '@api/types/calendarTypes'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { getCalendarEditorPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'
import { CalendarUnitEditorTab } from '../CalendarUnitEditor'
import { CalendarUnitChildList } from './childList/CalendarUnitChildList'
import { CalendarUnitAddChildForm } from './components/CalendarUnitAddChildForm'

type Props = {
	unit: CalendarDraftUnit
}

export function CalendarUnitStructure({ unit }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)
	const allUnits = useMemo(() => calendar?.units ?? [], [calendar])

	const availableChildren = useMemo(() => allUnits.filter((u) => u.id !== unit.id), [allUnits, unit.id])

	const { expandedUnitSections } = useSelector(
		getCalendarEditorPreferences,
		(a, b) =>
			a.expandedUnitSections.includes(CalendarUnitEditorTab.Structure) ===
			b.expandedUnitSections.includes(CalendarUnitEditorTab.Structure),
	)
	const { toggleExpandedCalendarUnitSection } = preferencesSlice.actions
	const dispatch = useDispatch()

	if (!calendar) {
		return null
	}

	return (
		<Accordion
			expanded={expandedUnitSections.includes(CalendarUnitEditorTab.Structure)}
			onChange={() => dispatch(toggleExpandedCalendarUnitSection(CalendarUnitEditorTab.Structure))}
		>
			<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header">
				<Typography component="span" sx={{ width: '33%', flexShrink: 0 }}>
					Structure
				</Typography>
				<Typography component="span" sx={{ color: 'text.secondary' }}>
					Time units contained within this one
				</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Stack gap={2}>
					<Stack sx={{ opacity: 0.5 }}>
						<Typography variant="subtitle2">Unit structure</Typography>
						<Typography variant="body2" color="text.secondary">
							Smaller units this unit is composed of. This defines the structure of the calendar and how
							timestamps are broken down.
							<br />
							When formatted in a time string, custom labels will be used instead of the display name if
							provided.
						</Typography>
					</Stack>
					<Divider />
					<CalendarUnitAddChildForm parent={unit} />
					{availableChildren.length > 0 && <CalendarUnitChildList key={unit.id} parent={unit} />}
					{availableChildren.length === 0 && (
						<Typography variant="body2" color="text.secondary">
							No other units available to add as children.
						</Typography>
					)}
				</Stack>
			</AccordionDetails>
		</Accordion>
	)
}
