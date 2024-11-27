import { memo, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { mockEventModel } from '@/api/rheaApi.mock'

import { worldSlice } from '../../reducer'
import { getWorldState } from '../../selectors'
import { WorldEvent } from '../../types'
import { EventDetailsEditor } from './components/EventDetailsEditor/EventDetailsEditor'

type Props = {
	mode?: 'create' | 'create-compact'
}

export const EventCreatorComponent = ({ mode }: Props) => {
	const { id, selectedTime } = useSelector(
		getWorldState,
		(a, b) => a.id === b.id && a.selectedTime === b.selectedTime,
	)

	const { setEventCreatorGhost } = worldSlice.actions
	const dispatch = useDispatch()

	const defaultEventValues: WorldEvent = useMemo(
		() =>
			mockEventModel({
				worldId: id,
				name: '',
				description: '',
				timestamp: selectedTime,
			}),
		[id, selectedTime],
	)

	useEffect(() => {
		dispatch(setEventCreatorGhost(defaultEventValues))
		return () => {
			dispatch(setEventCreatorGhost(null))
		}
	}, [defaultEventValues, dispatch, setEventCreatorGhost])

	return <EventDetailsEditor event={defaultEventValues} mode={mode ?? 'create'} />
}

export const EventCreator = memo(EventCreatorComponent)
