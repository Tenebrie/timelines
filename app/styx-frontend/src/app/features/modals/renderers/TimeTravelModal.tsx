import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { Shortcut, useShortcut } from '@/app/hooks/useShortcut'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

import { useEventBusDispatch } from '../../eventBus'
import { useTimeSelector } from '../../time/hooks/useTimeSelector'
import { useWorldTime } from '../../time/hooks/useWorldTime'
import { getWorldState } from '../../world/selectors'
import { WorldCalendarType } from '../../worldTimeline/types'
import { useModal } from '../reducer'
import { TimeTravelModalInfo } from './TimeTravelModalInfo'

export const TimeTravelModal = () => {
	const { isOpen, close } = useModal('timeTravelModal')
	const navigate = useNavigate({ from: '/world/$worldId' })

	const { selectedTime, calendar } = useSelector(
		getWorldState,
		(a, b) => a.selectedTime === b.selectedTime && a.calendar === b.calendar,
	)

	const { timeToLabel } = useWorldTime()
	const { applySelector } = useTimeSelector({ rawTime: selectedTime })

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
			const { timestamp } = applySelector(value)
			setTargetTime(timestamp)

			setDisplayedTargetTime(timeToLabel(timestamp))
		},
		[applySelector, timeToLabel],
	)

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			const { timestamp } = applySelector(timeSelector)
			setTargetTime(timestamp)
			setDisplayedTargetTime(timeToLabel(timestamp))
		},
	})

	const scrollTimelineTo = useEventBusDispatch({ event: 'scrollTimelineTo' })

	const onConfirm = useCallback(() => {
		if (!isOpen) {
			return
		}
		scrollTimelineTo({ timestamp: targetTime })
		navigate({
			search: (prev) => ({
				...prev,
				time: targetTime,
			}),
		})
		close()
	}, [isOpen, targetTime, scrollTimelineTo, navigate, close])

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
			<Typography>
				<b>Travel to:</b> {displayedTargetTime}
			</Typography>
			<Divider />
			<TimeTravelModalInfo />
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
