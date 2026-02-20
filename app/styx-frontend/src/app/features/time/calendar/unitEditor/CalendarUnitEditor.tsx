import { CalendarDraftUnit } from '@api/types/calendarTypes'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../CalendarSliceSelectors'
import { CalendarUnitTitle } from './components/CalendarUnitTitle'
import { CalendarUnitFormat } from './format/CalendarUnitFormat'
import { CalendarUnitDisplayNames } from './names/CalendarUnitDisplayNames'
import { CalendarUnitStructure } from './structure/CalendarUnitStructure'

type Props = {
	unit: CalendarDraftUnit
	onClose: () => void
}

export enum CalendarUnitEditorTab {
	Names = 'names',
	Formatting = 'formatting',
	Structure = 'structure',
	Preview = 'preview',
}

export function CalendarUnitEditor({ unit, onClose }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)

	if (!calendar) {
		return null
	}

	return (
		<Stack gap={2} direction="row">
			<Stack sx={{ flex: 1 }}>
				<Stack gap={1}>
					<CalendarUnitTitle unit={unit} onClose={onClose} />
					<Divider />
				</Stack>

				<CalendarUnitDisplayNames unit={unit} />
				<CalendarUnitFormat unit={unit} />
				<CalendarUnitStructure unit={unit} />
			</Stack>
		</Stack>
	)
}
