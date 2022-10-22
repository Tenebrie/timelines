import { Outlet } from 'react-router-dom'

import { EventWizard } from './components/EventWizard/EventWizard'
import { Timeline } from './components/Timeline/Timeline'
import { WorldContainer } from './styles'

export const World = () => {
	return (
		<WorldContainer>
			<Outlet />
			<Timeline />
			<EventWizard />
		</WorldContainer>
	)
}
