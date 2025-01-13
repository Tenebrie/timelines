import { Shortcut, useShortcut } from '@/hooks/useShortcut'

import { useModal } from './reducer'
import { EventTrackEditModal } from './renderers/EventTrackEditModal'
import { EventTrackWizardModal } from './renderers/EventTrackWizardModal'
import { TimeTravelModal } from './renderers/TimeTravelModal'

export const ModalRenderer = () => {
	const { open: openTimeTravelModal } = useModal('timeTravelModal')

	useShortcut(Shortcut.Search, () => {
		openTimeTravelModal({})
	})

	return (
		<>
			<EventTrackEditModal />
			<EventTrackWizardModal />
			<TimeTravelModal />
		</>
	)
}
