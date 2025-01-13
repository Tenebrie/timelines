import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Shortcut, useShortcut } from '@/hooks/useShortcut'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

import { useTimeSelector } from '../../time/hooks/useTimeSelector'
import { useWorldTime } from '../../time/hooks/useWorldTime'
import { useTimelineBusDispatch } from '../../worldTimeline/hooks/useTimelineBus'
import { worldSlice } from '../../worldTimeline/reducer'
import { getWorldState } from '../../worldTimeline/selectors'
import { WorldCalendarType } from '../../worldTimeline/types'
import { useModal } from '../reducer'

export const TimeTravelModal = () => {
	const { isOpen, close } = useModal('timeTravelModal')

	const { selectedTime, calendar } = useSelector(
		getWorldState,
		(a, b) => a.selectedTime === b.selectedTime && a.calendar === b.calendar,
	)

	const { setSelectedTime } = worldSlice.actions
	const dispatch = useDispatch()

	const { timeToLabel } = useWorldTime()
	const { parseSelector } = useTimeSelector({ rawTime: selectedTime })

	const calendarRef = useRef<WorldCalendarType>(null)
	const selectorRef = useRef<HTMLInputElement | null>(null)
	const [timeSelector, setTimeSelector] = useState('')
	const [targetTime, setTargetTime] = useState(selectedTime)
	const [displayedTargetTime, setDisplayedTargetTime] = useState('')

	useEffect(() => {
		if (calendar !== calendarRef.current) {
			setTargetTime(selectedTime)
			setDisplayedTargetTime(timeToLabel(selectedTime))
		}
		calendarRef.current = calendar
	}, [calendar, selectedTime, targetTime, timeToLabel])

	const onSelectorChanged = useCallback(
		(value: string) => {
			setTimeSelector(value)
			const { timestamp } = parseSelector(value)
			setTargetTime(timestamp)

			setDisplayedTargetTime(timeToLabel(timestamp))
		},
		[parseSelector, timeToLabel],
	)

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			const { timestamp } = parseSelector(timeSelector)
			setTargetTime(timestamp)
			setDisplayedTargetTime(timeToLabel(timestamp))
		},
	})

	const scrollTimelineTo = useTimelineBusDispatch()

	const onConfirm = useCallback(() => {
		if (!isOpen) {
			return
		}
		dispatch(setSelectedTime(targetTime))
		scrollTimelineTo(targetTime)
		close()
	}, [isOpen, dispatch, setSelectedTime, targetTime, scrollTimelineTo, close])

	useEffect(() => {
		const interval = window.setInterval(() => {
			if (selectorRef.current && isOpen) {
				selectorRef.current.select()
				window.clearInterval(interval)
			}
		}, 10)
		return () => {
			window.clearInterval(interval)
		}
	}, [isOpen, selectorRef, timeToLabel])

	const { largeLabel: shortcutLabel } = useShortcut(
		[Shortcut.Enter, Shortcut.CtrlEnter],
		() => onConfirm(),
		isOpen ? 1 : -1,
	)

	return (
		<Modal visible={isOpen} onClose={close}>
			<ModalHeader>Move to time</ModalHeader>
			<TextField
				label="Selector"
				type="text"
				inputRef={selectorRef}
				value={timeSelector}
				onChange={(event) => onSelectorChanged(event.target.value)}
				autoFocus
			/>
			<Typography>Travel to: {displayedTargetTime}</Typography>
			<ModalFooter>
				<Stack direction="row-reverse" justifyContent="space-between" width="100%">
					<Stack direction="row-reverse" spacing={2}>
						<Tooltip title={shortcutLabel} arrow placement="top">
							<Button variant="contained" color="primary" onClick={onConfirm}>
								Confirm
							</Button>
						</Tooltip>
						<Button variant="outlined" onClick={close}>
							Cancel
						</Button>
					</Stack>
				</Stack>
			</ModalFooter>
		</Modal>
	)
}
