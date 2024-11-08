import { EventTrackEditModal } from './renderers/EventTrackEditModal'
import { EventTrackWizardModal } from './renderers/EventTrackWizardModal'

export const ModalRenderer = () => {
	return (
		<>
			<EventTrackEditModal />
			<EventTrackWizardModal />
		</>
	)
}
