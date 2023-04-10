import { Outlet } from 'react-router-dom'

import { BlockingSpinner } from '../../components/BlockingSpinner'
import { EventWizardModal } from './components/EventWizard/EventWizardModal'
import { OverviewPanel } from './components/OverviewPanel/OverviewPanel'
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
			<div
				style={{
					position: 'relative',
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<WorldNavigator />
				<WorldContainer>
					<OverviewPanel />
					<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
						<WorldContent>
							<Outlet />
						</WorldContent>
					</div>
				</WorldContainer>
				{isLoaded && <Timeline />}
			</div>
			<BlockingSpinner visible={!isLoaded} />
			<EventWizardModal />
		</>
	)
}
