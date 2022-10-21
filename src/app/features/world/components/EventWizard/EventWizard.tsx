import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Modal from '../../../../../ui-lib/components/Modal/Modal'
import { makeStoryEvent } from '../../creators'
import { worldSlice } from '../../reducer'
import { getEventWizardState } from '../../selectors'

export const EventWizard = () => {
	const { isOpen, timestamp } = useSelector(getEventWizardState)

	const dispatch = useDispatch()
	const { createEvent, closeEventWizard } = worldSlice.actions

	const [name, setName] = useState('')

	useEffect(() => {
		if (!isOpen) {
			return
		}

		setName('')
	}, [isOpen])

	const onConfirm = () => {
		dispatch(
			createEvent(
				makeStoryEvent({
					name,
					timestamp,
				})
			)
		)
		dispatch(closeEventWizard())
	}

	return (
		<Modal visible={isOpen} onClose={() => dispatch(closeEventWizard())}>
			<span>Name:</span>
			<input type="text" value={name} onChange={(event) => setName(event.target.value)} />
			<button onClick={onConfirm}>Create</button>
		</Modal>
	)
}
