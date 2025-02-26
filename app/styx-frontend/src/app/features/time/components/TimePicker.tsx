import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { memo, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { WorldCalendarType } from '@/api/types/types'

import { useWorldTime } from '../hooks/useWorldTime'

type Props = {
	calendar: WorldCalendarType
	initialTimestamp: number
	visible: boolean
	onSetTimestamp: (timestamp: number) => void
}

const Spoiler = styled.div<{ $visible: boolean }>`
	overflow: hidden;
	transition: max-height 0.3s;

	max-height: ${(props) => (props.$visible ? '64px' : '0')};
`

const Container = styled.div`
	padding-top: 8px;
	border-radius: 4px;
	border: none;
	gap: 8px;

	display: flex;
	flex-direction: row;
`

export const TimePickerComponent = ({ calendar, initialTimestamp, visible, onSetTimestamp }: Props) => {
	const [renderInt, setRenderInt] = useState(0)
	const oldCalendar = useRef(calendar)
	const timestamp = useRef(initialTimestamp)

	const { parseTime, pickerToTimestamp, months } = useWorldTime({ calendar })
	const parsedTime = parseTime(initialTimestamp)

	const years = useRef(parsedTime.year)
	const selectedMonth = useRef(months[parsedTime.monthIndex])
	const days = useRef(parsedTime.day)
	const hours = useRef(parsedTime.hour)
	const minutes = useRef(parsedTime.minute)

	const updateUpstreamTimestamp = () => {
		const value = pickerToTimestamp({
			year: years.current,
			monthIndex: months.length > 0 ? months.indexOf(selectedMonth.current) : 0,
			day: days.current - 1,
			hour: hours.current,
			minute: minutes.current,
		})

		if (value === timestamp.current) {
			return
		}

		timestamp.current = value
		onSetTimestamp(value)
	}

	useEffect(() => {
		if (calendar === oldCalendar.current && initialTimestamp === timestamp.current) {
			return
		}

		timestamp.current = initialTimestamp
		oldCalendar.current = calendar

		years.current = parsedTime.year
		selectedMonth.current = months[parsedTime.monthIndex]
		days.current = parsedTime.day
		hours.current = parsedTime.hour
		minutes.current = parsedTime.minute

		setRenderInt(renderInt + 1)
	}, [calendar, initialTimestamp, months, oldCalendar, parsedTime, renderInt])

	const actualSelectedMonth = months.includes(selectedMonth.current) ? selectedMonth.current : months[0]

	return (
		<Spoiler $visible={visible}>
			<Container>
				<TextField
					style={{ width: '50%' }}
					type="number"
					label="Year"
					variant="outlined"
					value={years.current}
					onChange={(event) => {
						years.current = Number(event.target.value)
						updateUpstreamTimestamp()
					}}
				/>
				{months.length > 0 && selectedMonth.current && (
					<FormControl style={{ width: '100%' }}>
						<InputLabel id="time-picker-month-label">Month</InputLabel>
						<Select
							value={actualSelectedMonth.name}
							label="Month"
							labelId="time-picker-month-label"
							onChange={(event) => {
								selectedMonth.current = months.find((month) => month.name === event.target.value)!
								updateUpstreamTimestamp()
							}}
						>
							{months.map((month) => (
								<MenuItem key={month.name} value={month.name}>
									{month.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				)}
				<TextField
					style={{ width: '50%' }}
					type="number"
					label="Day"
					variant="outlined"
					value={days.current}
					onChange={(event) => {
						days.current = Number(event.target.value)
						updateUpstreamTimestamp()
					}}
				/>
				<TextField
					style={{ width: '50%' }}
					type="number"
					label="Hour"
					variant="outlined"
					value={hours.current}
					onChange={(event) => {
						hours.current = Number(event.target.value)
						updateUpstreamTimestamp()
					}}
				/>
				<TextField
					style={{ width: '50%' }}
					type="number"
					label="Minute"
					variant="outlined"
					value={minutes.current}
					onChange={(event) => {
						minutes.current = Number(event.target.value)
						updateUpstreamTimestamp()
					}}
				/>
			</Container>
		</Spoiler>
	)
}

export const TimePicker = memo(TimePickerComponent)
