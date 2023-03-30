import { Outlet } from 'react-router-dom'

import { EventWizardModal } from './components/EventWizard/EventWizardModal'
import { Timeline } from './components/Timeline/Timeline'
import { WorldContainer } from './styles'

export const World = () => {
	return (
		<WorldContainer>
			<Outlet />
			<Timeline />
			<EventWizardModal />
		</WorldContainer>
	)
}
