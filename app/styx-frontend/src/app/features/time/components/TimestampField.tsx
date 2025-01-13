import CalendarMonth from '@mui/icons-material/CalendarMonth'
import Clear from '@mui/icons-material/Clear'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import styled from 'styled-components'

import { WorldCalendarType } from '../../worldTimeline/types'
import { useWorldTime } from '../hooks/useWorldTime'
import { TimePicker } from './TimePicker'

type Props = {
	timestamp: number | undefined
	initialTimestamp?: number
	label?: string
	calendar?: WorldCalendarType
} & (
	| {
			onChangeClearable: (value: number | undefined) => void
			clearable: true
	  }
	| {
			onChange: (value: number) => void
	  }
)

const StyledStack = styled(Stack)`
	transition: gap 0.3s;
`

export const TimestampField = (props: Props) => {
	const { timestamp, initialTimestamp, label, calendar } = props
	const [timePickerOpen, setTimePickerOpen] = useState<boolean>(false)
	const { calendar: usedCalendar, timeToLabel } = useWorldTime({ calendar })

	const readableTimestamp = timestamp !== undefined ? timeToLabel(timestamp) : 'Never'

	const onChange = 'onChangeClearable' in props ? props.onChangeClearable : props.onChange
	const clearable = 'clearable' in props ? props.clearable : false

	return (
		<StyledStack direction="column" gap={timePickerOpen ? 1 : 0}>
			<Stack direction="row" gap={1}>
				<FormControl fullWidth>
					<TextField label={label ? label : 'Timestamp'} value={readableTimestamp} disabled />
				</FormControl>
				<Button onClick={() => setTimePickerOpen(!timePickerOpen)}>
					<CalendarMonth />
				</Button>
				{clearable && (
					<Button onClick={() => (onChange as (value: number | undefined) => void)(undefined)}>
						<Clear />
					</Button>
				)}
			</Stack>
			<TimePicker
				calendar={usedCalendar}
				initialTimestamp={timestamp ?? initialTimestamp ?? 0}
				visible={timePickerOpen}
				onSetTimestamp={onChange}
			/>
		</StyledStack>
	)
}
