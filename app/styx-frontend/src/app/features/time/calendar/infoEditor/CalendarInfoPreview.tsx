import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useDispatch, useSelector } from 'react-redux'

import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { getCalendarEditorPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'

import { getCalendarEditorState } from '../CalendarSliceSelectors'
import { CalendarUnitEditorTab } from '../unitEditor/CalendarUnitEditor'
import { CalendarUnitPreviewTree } from '../unitEditor/preview/components/CalendarUnitPreviewTree'

export function CalendarInfoPreview() {
	const rootUnits = useSelector(getCalendarEditorState).calendar?.units.filter((u) => u.treeDepth === 0) ?? []

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
			elevation={2}
			disableGutters
		>
			<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header">
				<Typography component="span" sx={{ width: '33%', flexShrink: 0 }}>
					Structure Preview
				</Typography>
				<Typography component="span" sx={{ color: 'text.secondary' }}>
					Units&apos; duration and structure
				</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Stack gap={2}>
					<Paper
						variant="outlined"
						sx={{ p: '12px', width: 'calc(100% - 24px)', bgcolor: 'background.default' }}
					>
						<Paper
							variant="outlined"
							sx={{ p: '12px', width: 'calc(100% - 24px)', bgcolor: 'background.default' }}
						>
							<Stack gap={1} sx={{ margin: '4px 8px' }}>
								{rootUnits.map((unit) => (
									<div key={unit.id}>
										<CalendarUnitPreviewTree unit={unit} visible />
									</div>
								))}
							</Stack>
						</Paper>
					</Paper>
				</Stack>
			</AccordionDetails>
		</Accordion>
	)
}
