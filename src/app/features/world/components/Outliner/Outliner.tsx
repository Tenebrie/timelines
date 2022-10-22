import { Button } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'

import { useWorldTime } from '../../../time/hooks/useWorldTime'
import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getWorldOutlinerState, getWorldState } from '../../selectors'
import { OutlinerContainer } from './styles'

export const Outliner = () => {
	const { events } = useSelector(getWorldState)
	const { selectedTime } = useSelector(getWorldOutlinerState)
	const { timeToLabel } = useWorldTime()

	const dispatch = useDispatch()
	const { openEventWizard } = worldSlice.actions

	const { navigateToRoot } = useWorldRouter()

	if (selectedTime === null) {
		navigateToRoot()
		return <></>
	}

	const applicableEvents = events.filter((event) => event.timestamp <= selectedTime)

	const onCreateEvent = () => {
		dispatch(openEventWizard({ timestamp: selectedTime }))
	}

	return (
		<OutlinerContainer>
			<div>{timeToLabel(selectedTime, true)}</div>
			<div>Applicable events: {applicableEvents.length}</div>
			<Button variant="outlined" onClick={onCreateEvent}>
				Create event here
			</Button>
		</OutlinerContainer>
	)
}
