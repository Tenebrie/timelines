import { Outlet } from 'react-router-dom'

import { BlockingSpinner } from '../../components/BlockingSpinner'
import { EventWizardModal } from './components/EventWizard/EventWizardModal'
import { Timeline } from './components/Timeline/Timeline'
import { WorldNavigator } from './components/WorldNavigator/WorldNavigator'
import { useLoadWorldInfo } from './hooks/useLoadWorldInfo'
import { useWorldRouter } from './router'
import { WorldContainer, WorldContent } from './styles'

export const World = () => {
	const { worldParams } = useWorldRouter()
	const { worldId } = worldParams

	const { isLoaded } = useLoadWorldInfo(worldId)

	return (
		<>
			<WorldContainer>
				<WorldNavigator />
				<WorldContent>
					<Outlet />
				</WorldContent>
				{isLoaded && <Timeline />}
			</WorldContainer>
			<BlockingSpinner visible={!isLoaded} />
			<EventWizardModal />
		</>
	)
}
