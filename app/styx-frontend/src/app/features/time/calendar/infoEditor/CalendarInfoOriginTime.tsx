import { useUpdateCalendarMutation } from '@api/calendarApi'
import SaveIcon from '@mui/icons-material/Save'
import UndoIcon from '@mui/icons-material/Undo'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { useAutosave } from '@/app/utils/autosave/useAutosave'

import { getCalendarEditorState } from '../CalendarSliceSelectors'
import { useFormatTimestamp } from '../hooks/useFormatTimestamp'

export function CalendarInfoOriginTime() {
	const { calendar } = useSelector(getCalendarEditorState)
	const [updateCalendar, { isLoading: isSavingNative }] = useUpdateCalendarMutation()

	const [localOriginTime, setLocalOriginTime] = useState<number>(0)

	const isDirty = useMemo(
		() => calendar !== null && localOriginTime !== Number(calendar.originTime),
		[calendar, localOriginTime],
	)

	const onUpdateOriginTime = useCallback(
		(originTime: number) => {
			if (!calendar) {
				return
			}
			setLocalOriginTime(originTime)
		},
		[calendar],
	)

	const onSave = useCallback(() => {
		if (!calendar || !isDirty) {
			return
		}
		updateCalendar({
			calendarId: calendar.id,
			body: { originTime: String(localOriginTime) },
		})
	}, [calendar, isDirty, localOriginTime, updateCalendar])

	const onClear = useCallback(() => {
		if (!calendar) {
			return
		}
		setLocalOriginTime(Number(calendar.originTime))
	}, [calendar])

	const {
		manualSave,
		icon: autosaveIcon,
		disabled,
		color: autosaveColor,
	} = useAutosave({
		defaultIcon: <SaveIcon />,
		onSave,
		isSaving: isSavingNative,
	})

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
				<Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
					<Button variant="outlined" startIcon={<UndoIcon />} onClick={onClear} disabled={!isDirty}>
						Clear
					</Button>
					<Button
						variant="contained"
						startIcon={autosaveIcon}
						onClick={manualSave}
						disabled={disabled || !isDirty}
						color={autosaveColor}
					>
						Save
					</Button>
				</Stack>
			</Stack>
		</Paper>
	)
}
