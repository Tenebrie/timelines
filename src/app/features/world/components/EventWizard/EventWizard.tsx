import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Modal from '../../../../../ui-lib/components/Modal/Modal'
import { makeStoryEvent } from '../../creators'
import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getEventWizardState } from '../../selectors'

export const EventWizard = () => {
	const { isOpen, timestamp } = useSelector(getEventWizardState)

	const dispatch = useDispatch()
	const { createEvent, closeEventWizard } = worldSlice.actions

	const { navigateToEventEditor } = useWorldRouter()

	const [name, setName] = useState('')

	useEffect(() => {
		if (!isOpen) {
			return
		}

		setName('')
	}, [isOpen])

	const onConfirm = () => {
		const newEvent = makeStoryEvent({
			name,
			timestamp,
		})
		dispatch(createEvent(newEvent))
		dispatch(closeEventWizard())
		navigateToEventEditor(newEvent)
	}

	return (
		<Modal visible={isOpen} onClose={() => dispatch(closeEventWizard())}>
			<span>Name:</span>
			<input type="text" value={name} onChange={(event) => setName(event.target.value)} />
			<button onClick={onConfirm}>Create</button>
		</Modal>
	)
}
