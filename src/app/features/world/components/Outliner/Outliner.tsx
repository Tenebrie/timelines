import { useDispatch, useSelector } from 'react-redux'

import { useWorldTime } from '../../../time/hooks/useWorldTime'
import { worldSlice } from '../../reducer'
import { getWorldOutlinerState, getWorldState } from '../../selectors'
import { OutlinerEmptyState } from './components/OutlinerEmptyState/OutlinerEmptyState'
import { OutlinerContainer } from './styles'

export const Outliner = () => {
	const { events } = useSelector(getWorldState)
	const { selectedTime } = useSelector(getWorldOutlinerState)
	const { timeToLabel } = useWorldTime()

	const dispatch = useDispatch()
	const { openEventWizard } = worldSlice.actions

	if (selectedTime === null) {
		return <OutlinerEmptyState />
	}

	const applicableEvents = events.filter((event) => event.timestamp <= selectedTime)

	const onCreateEvent = () => {
		dispatch(openEventWizard({ timestamp: selectedTime }))
	}

	return (
		<OutlinerContainer>
			<div>{timeToLabel(selectedTime, true)}</div>
			<div>Applicable events: {applicableEvents.length}</div>
			<button onClick={onCreateEvent}>Create event here</button>
		</OutlinerContainer>
	)
}
