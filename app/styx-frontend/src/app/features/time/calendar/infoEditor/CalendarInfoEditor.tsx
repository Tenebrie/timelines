import { useUpdateCalendarMutation } from '@api/calendarApi'
import Divider from '@mui/material/Divider'
import Input from '@mui/material/Input'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../CalendarSliceSelectors'
import { useFormatTimestamp } from '../hooks/useFormatTimestamp'
import { CalendarInfoPreview } from './CalendarInfoPreview'

export function CalendarInfoEditor() {
	const { calendar } = useSelector(getCalendarEditorState)
	const [updateCalendar] = useUpdateCalendarMutation()

	const [localOriginTime, setLocalOriginTime] = useState<number>(0)

	const onUpdateCalendarDebounced = useMemo(
		() =>
			debounce((calendarId: string, body: { originTime: string }) => {
				updateCalendar({
					calendarId,
					body,
				})
			}, 1000),
		[updateCalendar],
	)

	const onUpdateOriginTime = useCallback(
		(originTime: number) => {
			if (!calendar) {
				return
			}
			onUpdateCalendarDebounced(calendar.id, { originTime: String(originTime) })
			setLocalOriginTime(originTime)
		},
		[calendar, onUpdateCalendarDebounced],
	)

	useEffect(() => {
		if (calendar) {
			setLocalOriginTime(Number(calendar.originTime))
		}
	}, [calendar])

	const formatTimestamp = useFormatTimestamp({
		calendar: calendar
			? {
					...calendar,
					originTime: '0',
				}
			: null,
	})

	return (
		<Stack sx={{ flex: 1, p: 2, gap: 2 }}>
			<Paper variant="outlined" sx={{ p: 3 }}>
				<Stack>
					<Stack direction="row" justifyContent="space-between">
						<Typography>Origin timestamp:</Typography>
						<Input
							inputProps={{
								'aria-label': 'Origin timestamp input',
							}}
							size="small"
							value={localOriginTime}
							type="number"
							onChange={(e) => {
								onUpdateOriginTime(Number(e.target.value))
							}}
							onKeyDown={(e) => {
								if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
									const direction = e.key === 'ArrowUp' ? 1 : -1
									let delta = 1
									if (e.shiftKey) {
										delta *= 10
									}
									if (e.ctrlKey || e.metaKey) {
										delta *= 1000
									}
									if (e.altKey) {
										delta *= 100000
									}
									onUpdateOriginTime(localOriginTime + direction * delta)
									e.preventDefault() // Prevent default increment behavior
								}
							}}
						/>
					</Stack>
					<Slider
						value={localOriginTime}
						min={-2103000000}
						max={2103000000}
						onChange={(_, val) => onUpdateOriginTime(val as number)}
					/>
					<Paper
						variant="outlined"
						aria-label="Origin timestamp preview"
						sx={{ p: '12px', width: 'calc(100% - 24px)', bgcolor: 'background.default' }}
					>
						<Typography color="text.primary">{formatTimestamp({ timestamp: localOriginTime })}</Typography>
					</Paper>
				</Stack>
			</Paper>
			<Stack>
				<Divider />
				<CalendarInfoPreview />
			</Stack>
		</Stack>
	)
}
