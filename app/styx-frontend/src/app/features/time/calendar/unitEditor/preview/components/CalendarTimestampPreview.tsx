import Input from '@mui/material/Input'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { useFormatTimestamp } from '@/app/features/time/calendar/hooks/useFormatTimestamp'
import { usePreviewCalendar } from '@/app/features/time/calendar/hooks/usePreviewCalendar'

export function CalendarTimestampPreview() {
	const [sliderValue, setSliderValue] = useState(0)
	const previewCalendar = usePreviewCalendar()

	const formatTimestamp = useFormatTimestamp({
		calendar: previewCalendar,
	})

	return (
		<Stack>
			<Stack direction="row" justifyContent="space-between">
				<Typography>Preview timestamp:</Typography>
				<Input
					size="small"
					value={sliderValue}
					type="number"
					onChange={(e) => setSliderValue(Number(e.target.value))}
				/>
			</Stack>
			<Slider
				value={sliderValue}
				min={-2103000}
				max={2103000}
				onChange={(_, val) => setSliderValue(val as number)}
			/>
			<Paper variant="outlined" sx={{ p: '12px', width: 'calc(100% - 24px)', bgcolor: 'background.default' }}>
				{previewCalendar && formatTimestamp({ timestamp: sliderValue })}
			</Paper>
		</Stack>
	)
}
