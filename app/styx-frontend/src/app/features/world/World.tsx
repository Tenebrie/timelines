import { Outlet } from 'react-router-dom'

import { EventWizardModal } from './components/EventWizard/EventWizardModal'
import { Timeline } from './components/Timeline/Timeline'
import { WorldNavigator } from './components/WorldNavigator/WorldNavigator'
import { WorldContainer, WorldContent } from './styles'

export const World = () => {
	return (
		<WorldContainer>
			<WorldNavigator />
			<WorldContent>
				<Outlet />
				<Timeline />
			</WorldContent>
			<EventWizardModal />
		</WorldContainer>
	)
}
