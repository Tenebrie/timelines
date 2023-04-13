import { CalendarMonth } from '@mui/icons-material'
import { Button, FormControl, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import styled from 'styled-components'

import { TimePicker } from '../../../../../time/components/TimePicker'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { WorldCalendarType } from '../../../../types'

type Props = {
	timestamp: number
	onChange: (value: number) => void
	label?: string
	calendar?: WorldCalendarType
}

const StyledTextField = styled(TextField)`
	.MuiInputBase-root {
		/* padding-bottom: 31px; */
	}
`

const OverlayingTimestamp = styled(Typography)`
	position: absolute;
	left: 14px;
	bottom: 14px;
`

export const EventTimestampField = ({ timestamp, onChange, label, calendar }: Props) => {
	const [timePickerOpen, setTimePickerOpen] = useState<boolean>(false)

	const { calendar: usedCalendar, timeToLabel } = useWorldTime({ calendar })
	const readableTimestamp = timeToLabel(timestamp)
	return (
		<Stack direction="column" gap={1}>
			<Stack direction="row" gap={2}>
				<FormControl fullWidth>
					<StyledTextField label={label ? label : 'Timestamp'} value={readableTimestamp} disabled />
				</FormControl>
				<Button onClick={() => setTimePickerOpen(!timePickerOpen)}>
					<CalendarMonth />
				</Button>
			</Stack>
			<TimePicker
				calendar={usedCalendar}
				initialTimestamp={timestamp}
				visible={timePickerOpen}
				onSetTimestamp={onChange}
			/>
		</Stack>
	)
}
