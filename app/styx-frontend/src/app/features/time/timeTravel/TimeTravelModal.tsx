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
import { useModal } from '../../modals/ModalsSlice'
import { TimeTravelModalInfo } from '../../modals/renderers/TimeTravelModalInfo'
import { useTimeSelector } from '../hooks/useTimeSelector'
import { useWorldTime } from '../hooks/useWorldTime'
import { useMarkerTimeTravel } from './useMarkerTimeTravel'

export const TimeTravelModal = () => {
	const { isOpen, close } = useModal('timeTravelModal')
	const navigate = useStableNavigate({ from: '/world/$worldId' })

	const { selectedTime, selectedTimelineMarkers } = useSelector(
		getWorldState,
		(a, b) => a.selectedTime === b.selectedTime && a.selectedTimelineMarkers === b.selectedTimelineMarkers,
	)

	const { timeToLabel, calendar } = useWorldTime()
	const { applySelector } = useTimeSelector({ rawTime: selectedTime })

	const calendarRef = useRef<WorldCalendar>(null)
	const selectorRef = useRef<HTMLInputElement | null>(null)

	const [timeSelector, setTimeSelector] = useState('')
	const [moveMarkersValue, setMoveMarkersValue] = useState(true)

	const [error, setError] = useState<string | null>(null)

	const [initialTime, setInitialTime] = useState(selectedTime)
	const [targetTime, setTargetTime] = useState(selectedTime)
	const [displayedTargetTime, setDisplayedTargetTime] = useState('')

	const [moveMarkers] = useMarkerTimeTravel()

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
			setError(null)

			setDisplayedTargetTime(timeToLabel(timestamp))
		},
		[applySelector, timeToLabel],
	)

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			const { timestamp } = applySelector(timeSelector)
			setTargetTime(timestamp)
			setInitialTime(selectedTime)
			setError(null)
			setDisplayedTargetTime(timeToLabel(timestamp))
		},
	})

	const scrollTimelineTo = useEventBusDispatch['timeline/requestScrollTo']()

	const onConfirm = useCallback(() => {
		if (!isOpen) {
			return
		}

		if (selectedTimelineMarkers.length > 0 && moveMarkersValue) {
			const result = moveMarkers(targetTime - initialTime)
			console.log(targetTime - initialTime)
			if (result.error) {
				setError(result.error)
				return
			}
		}

		scrollTimelineTo({ timestamp: targetTime })
		navigate({
			search: (prev) => ({
				...prev,
				time: targetTime,
			}),
		})

		close()
	}, [
		isOpen,
		scrollTimelineTo,
		targetTime,
		navigate,
		selectedTimelineMarkers.length,
		moveMarkersValue,
		close,
		moveMarkers,
		initialTime,
	])

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
		<Modal visible={isOpen} onClose={close} closeOnBackdropClick>
			<ModalHeader>Move to time</ModalHeader>
			<TextField
				label="Selector"
				type="text"
				inputRef={selectorRef}
				value={timeSelector}
				onChange={(event) => onSelectorChanged(event.target.value)}
				autoFocus
				helperText={error}
				error={!!error}
			/>
			<Typography>
				<b>Travel to:</b> {displayedTargetTime}
			</Typography>
			{selectedTimelineMarkers.length > 0 && (
				<FormControlLabel
					control={
						<Checkbox
							checked={moveMarkersValue}
							onChange={(event) => setMoveMarkersValue(event.target.checked)}
						/>
					}
					label="Move selected markers"
				/>
			)}
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
