import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import useEvent from 'react-use-event-hook'

import { usePreviewCalendar } from '../../hooks/usePreviewCalendar'
import { Calendar } from '../../types'

export function CalendarTimestampPreview() {
	const [sliderValue, setSliderValue] = useState(15443)
	const previewCalendar = usePreviewCalendar()

	const formatTimestamp = useFormatTimestamp()

	return (
		<Stack>
			<Typography>Timestamp: {sliderValue}</Typography>
			<Slider value={sliderValue} min={1} max={100000} onChange={(e, val) => setSliderValue(val as number)} />
			<Paper variant="outlined" sx={{ p: '12px', width: 'calc(100% - 24px)', bgcolor: 'background.default' }}>
				{previewCalendar && formatTimestamp({ timestamp: sliderValue, calendar: previewCalendar })}
			</Paper>
		</Stack>
	)
}

function useFormatTimestamp() {
	const format = useEvent(({ timestamp, calendar }: { timestamp: number; calendar: Calendar }) => {
		// const rootUnits = calendar.units.filter((u) => !u.parentId)
		return 'N/A'
	})

	return format
}
