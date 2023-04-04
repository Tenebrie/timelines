import { Outlet } from 'react-router-dom'

import { EventWizardModal } from './components/EventWizard/EventWizardModal'
import { Timeline } from './components/Timeline/Timeline'
import { WorldNavigator } from './components/WorldNavigator/WorldNavigator'
import { useLoadWorldInfo } from './hooks/useLoadWorldInfo'
import { useWorldRouter } from './router'
import { WorldContainer, WorldContent } from './styles'

export const World = () => {
	const { worldParams } = useWorldRouter()
	const { worldId } = worldParams

	useLoadWorldInfo(worldId)

	return (
		<>
			<WorldContainer>
				<WorldNavigator />
				<WorldContent>
					<Outlet />
				</WorldContent>
				<Timeline />
			</WorldContainer>
			<EventWizardModal />
		</>
	)
}
