import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import { useModal } from '@/app/features/modals/reducer'
import { ModalFooter } from '@/ui-lib/components/Modal'
import Modal from '@/ui-lib/components/Modal/Modal'
import { ModalHeader } from '@/ui-lib/components/Modal/styles'

export const EventTutorialModal = () => {
	const { isOpen, close } = useModal('eventTutorialModal')

	return (
		<Modal visible={isOpen} onClose={close}>
			<ModalHeader>Event Tutorial</ModalHeader>
			<Typography variant="body1">
				In Timelines app, a project (referred to as a <b>World</b>) contains many events that have associated
				timestamp, icon, and other metadata. An <b>Event</b> describes the moment of something happening, for
				example
				<i>"The adventurers have reached the inn"</i>" may happen on Day 1.
			</Typography>
			<Typography variant="body1">
				Most events contain a number of <b>Statements</b>. A statement describes the state of the world
				between events. In an example above, there can be a statement <i>"The adventurers are in the inn"</i>.
				This statement will be in effect until a later event revokes it. For example, event{' '}
				<i>"The adventurers have left the inn"</i> may happen on Day 10, and it should revoke the{' '}
				<i>"The adventurers are in the inn"</i> statement.
			</Typography>
			<Typography variant="body1">
				The result of the example above will be a world where the adventurers are in the inn between Day 1 and
				Day 10, and inspecting the state of the world will only show this statement between the two events.
			</Typography>
			<ModalFooter>
				<Button variant="outlined" onClick={close}>
					Close
				</Button>
			</ModalFooter>
		</Modal>
	)
}
