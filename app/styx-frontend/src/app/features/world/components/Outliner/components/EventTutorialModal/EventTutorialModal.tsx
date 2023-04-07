import { Button } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'

import { ModalFooter } from '../../../../../../../ui-lib/components/Modal'
import Modal from '../../../../../../../ui-lib/components/Modal/Modal'
import { ModalHeader } from '../../../../../../../ui-lib/components/Modal/styles'
import { worldSlice } from '../../../../reducer'
import { getEventTutorialModalState } from '../../../../selectors'

export const EventTutorialModal = () => {
	const dispatch = useDispatch()
	const { closeEventTutorialModal } = worldSlice.actions

	const { isOpen } = useSelector(getEventTutorialModalState)

	const onCloseAttempt = () => {
		dispatch(closeEventTutorialModal())
	}

	return (
		<Modal visible={isOpen} onClose={onCloseAttempt}>
			<ModalHeader>Event Tutorial</ModalHeader>
			<p>This tutorial is under construction :(</p>
			<ModalFooter>
				<Button variant="outlined" onClick={onCloseAttempt}>
					Close
				</Button>
			</ModalFooter>
		</Modal>
	)
}
