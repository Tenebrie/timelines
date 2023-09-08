import { useOutlet } from 'react-router-dom'
import { CSSTransition, SwitchTransition } from 'react-transition-group'

import { useLocationRef } from '../../../hooks/useLocationRef'
import { BlockingSpinner } from '../../components/BlockingSpinner'
import { ActorWizardModal } from './components/ActorWizard/ActorWizardModal'
import { DeleteEventDeltaModal } from './components/EventEditor/components/DeleteEventDeltaModal/DeleteEventDeltaModal'
import { DeleteEventModal } from './components/EventEditor/components/DeleteEventModal/DeleteEventModal'
import { RevokedStatementWizard } from './components/EventEditor/components/RevokedStatementWizard/RevokedStatementWizard'
import { EventWizardModal } from './components/EventWizard/EventWizardModal'
import { OverviewPanel } from './components/OverviewPanel/OverviewPanel'
import { Timeline } from './components/Timeline/Timeline'
import { TimelinePlaceholder } from './components/Timeline/TimelinePlaceholder'
import { WorldNavigator } from './components/WorldNavigator/WorldNavigator'
import { useLoadWorldInfo } from './hooks/useLoadWorldInfo'
import { useWorldRouter } from './router'
import { WorldContainer, WorldContent } from './styles'

export const World = () => {
	const { worldParams } = useWorldRouter()
	const { worldId } = worldParams

	const { isLoaded } = useLoadWorldInfo(worldId)

	const currentOutlet = useOutlet()
	const { key, nodeRef } = useLocationRef()

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
						<SwitchTransition>
							<CSSTransition key={key} timeout={300} classNames="fade" unmountOnExit nodeRef={nodeRef}>
								<WorldContent ref={nodeRef}>{currentOutlet}</WorldContent>
							</CSSTransition>
						</SwitchTransition>
					</div>
				</WorldContainer>
				{isLoaded && <Timeline />}
				{!isLoaded && <TimelinePlaceholder />}
			</div>
			<BlockingSpinner visible={!isLoaded} />
			<ActorWizardModal />
			<EventWizardModal />
			<RevokedStatementWizard />
			<DeleteEventModal />
			<DeleteEventDeltaModal />
		</>
	)
}
