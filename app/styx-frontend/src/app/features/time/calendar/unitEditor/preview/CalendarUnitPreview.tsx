import { CalendarDraftUnit } from '@api/types/calendarTypes'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useDispatch, useSelector } from 'react-redux'

import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { getCalendarEditorPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'

import { CalendarUnitEditorTab } from '../CalendarUnitEditor'
import { CalendarUnitPreviewDuration } from './components/CalendarUnitPreviewDuration'
import { CalendarUnitPreviewTree } from './components/CalendarUnitPreviewTree'

type Props = {
	unit: CalendarDraftUnit
}

export function CalendarUnitPreview({ unit }: Props) {
	const { expandedUnitSections } = useSelector(
		getCalendarEditorPreferences,
		(a, b) =>
			a.expandedUnitSections.includes(CalendarUnitEditorTab.Preview) ===
			b.expandedUnitSections.includes(CalendarUnitEditorTab.Preview),
	)
	const { toggleExpandedCalendarUnitSection } = preferencesSlice.actions
	const dispatch = useDispatch()

	return (
		<Accordion
			expanded={expandedUnitSections.includes(CalendarUnitEditorTab.Preview)}
			onChange={() => dispatch(toggleExpandedCalendarUnitSection(CalendarUnitEditorTab.Preview))}
		>
			<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header">
				<Typography component="span" sx={{ width: '33%', flexShrink: 0 }}>
					Preview
				</Typography>
				<Typography component="span" sx={{ color: 'text.secondary' }}>
					Unit&apos;s duration and structure
				</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Stack gap={2}>
					<Paper
						variant="outlined"
						sx={{ p: '12px', width: 'calc(100% - 24px)', bgcolor: 'background.default' }}
					>
						<CalendarUnitPreviewDuration unit={unit} />
					</Paper>
					<Divider />
					<Paper
						variant="outlined"
						sx={{ p: '12px', width: 'calc(100% - 24px)', bgcolor: 'background.default' }}
					>
						<CalendarUnitPreviewTree
							unit={unit}
							visible={expandedUnitSections.includes(CalendarUnitEditorTab.Preview)}
						/>
					</Paper>
				</Stack>
			</AccordionDetails>
		</Accordion>
	)
}
