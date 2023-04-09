import { Button, Typography } from '@mui/material'
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
			<Typography variant="body1">
				In Timelines app, a project (referred to as a "world") contains many events that have associated
				timestamp, icon, and other metadata. An event describes the moment of something happening, for example
				"The adventurers have reached the inn" event may happen on Day 1.
			</Typography>
			<Typography variant="body1">
				Most events contain a number of "statements". A statement describes the state of the world between
				event. In an example above, there can be a statement "The adventurers are in the inn". This statement
				will be in effect until a later event revokes it. For example, event "The adventurers have left the
				inn" may happen on Day 10, and it should revoke the "The adventurers are in the inn" statement.
			</Typography>
			<Typography variant="body1">
				The result of the example above will be a world where the adventurers are in the inn between Day 1 and
				Day 10, and inspecting the state of the world will only show this statement between the two events.
			</Typography>
			<ModalFooter>
				<Button variant="outlined" onClick={onCloseAttempt}>
					Close
				</Button>
			</ModalFooter>
		</Modal>
	)
}
