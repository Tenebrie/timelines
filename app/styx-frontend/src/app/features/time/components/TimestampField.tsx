import { CalendarMonth } from '@mui/icons-material'
import { Button, FormControl, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import styled from 'styled-components'

import { WorldCalendarType } from '../../world/types'
import { useWorldTime } from '../hooks/useWorldTime'
import { TimePicker } from './TimePicker'

type Props = {
	timestamp: number
	onChange: (value: number) => void
	label?: string
	calendar?: WorldCalendarType
}

const StyledStack = styled(Stack)`
	transition: gap 0.3s;
`

export const TimestampField = ({ timestamp, onChange, label, calendar }: Props) => {
	const [timePickerOpen, setTimePickerOpen] = useState<boolean>(false)

	const { calendar: usedCalendar, timeToLabel } = useWorldTime({ calendar })
	const readableTimestamp = timeToLabel(timestamp)
	return (
		<StyledStack direction="column" gap={timePickerOpen ? 1 : 0}>
			<Stack direction="row" gap={2}>
				<FormControl fullWidth>
					<TextField label={label ? label : 'Timestamp'} value={readableTimestamp} disabled />
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
		</StyledStack>
	)
}
