import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { WorldCalendarType } from '../../world/types'
import { useWorldTime } from '../hooks/useWorldTime'

type Props = {
	calendar: WorldCalendarType
	initialTimestamp: number
	visible: boolean
	onSetTimestamp: (timestamp: number) => void
}

const Spoiler = styled.div<{ visible: boolean }>`
	overflow: hidden;
	transition: max-height 0.3s;

	max-height: ${(props) => (props.visible ? '64px' : '0')};
`

const Container = styled.div`
	padding-top: 8px;
	border-radius: 4px;
	border: none;
	gap: 8px;

	display: flex;
	flex-direction: row;
`

export const TimePicker = ({ calendar, initialTimestamp, visible, onSetTimestamp }: Props) => {
	const [renderInt, setRenderInt] = useState(0)
	const oldCalendar = useRef(calendar)
	const timestamp = useRef(initialTimestamp)

	const { parseTime, pickerToTimestamp, months } = useWorldTime({ calendar })
	const parsedTime = parseTime(initialTimestamp)

	const years = useRef(parsedTime.year)
	const selectedMonth = useRef(months[0])
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
		if (calendar === oldCalendar.current) {
			return
		}

		timestamp.current = initialTimestamp
		oldCalendar.current = calendar

		years.current = parsedTime.year
		selectedMonth.current = months[0]
		days.current = parsedTime.day
		hours.current = parsedTime.hour
		minutes.current = parsedTime.minute

		setRenderInt(renderInt + 1)
	}, [calendar, initialTimestamp, months, oldCalendar, parsedTime, renderInt])

	return (
		<Spoiler visible={visible}>
			<Container>
				<TextField
					style={{ width: '50%' }}
					type="number"
					label="Year"
					variant="outlined"
					value={years.current}
					onChange={(props) => {
						years.current = Number(props.target.value)
						updateUpstreamTimestamp()
					}}
				/>
				{months.length > 0 && selectedMonth.current && (
					<FormControl style={{ width: '100%' }}>
						<InputLabel id="time-picker-month-label">Month</InputLabel>
						<Select
							value={selectedMonth.current.name}
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
					onChange={(props) => {
						days.current = Number(props.target.value)
						updateUpstreamTimestamp()
					}}
				/>
				<TextField
					style={{ width: '50%' }}
					type="number"
					label="Hour"
					variant="outlined"
					value={hours.current}
					onChange={(props) => {
						hours.current = Number(props.target.value)
						updateUpstreamTimestamp()
					}}
				/>
				<TextField
					style={{ width: '50%' }}
					type="number"
					label="Minute"
					variant="outlined"
					value={minutes.current}
					onChange={(props) => {
						minutes.current = Number(props.target.value)
						updateUpstreamTimestamp()
					}}
				/>
			</Container>
		</Spoiler>
	)
}
