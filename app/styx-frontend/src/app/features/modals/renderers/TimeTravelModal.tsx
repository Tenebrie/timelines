import { WorldCalendar } from '@api/types/worldTypes'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

import { useEventBusDispatch } from '../../eventBus'
import { useTimeSelector } from '../../time/hooks/useTimeSelector'
import { useWorldTime } from '../../time/hooks/useWorldTime'
import { useModal } from '../ModalsSlice'
import { TimeTravelModalInfo } from './TimeTravelModalInfo'

export const TimeTravelModal = () => {
	const { isOpen, close } = useModal('timeTravelModal')
	const navigate = useStableNavigate({ from: '/world/$worldId' })

	const { selectedTime } = useSelector(getWorldState, (a, b) => a.selectedTime === b.selectedTime)

	const { timeToLabel, calendar } = useWorldTime()
	const { applySelector } = useTimeSelector({ rawTime: selectedTime })

	const calendarRef = useRef<WorldCalendar>(null)
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

	const scrollTimelineTo = useEventBusDispatch['timeline/requestScrollTo']()

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
			<FormControlLabel control={<Checkbox defaultChecked />} label="Move selected events" />
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
