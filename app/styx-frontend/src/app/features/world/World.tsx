import Stack from '@mui/material/Stack'
import { Navigate, Outlet } from 'react-router-dom'

import { BlockingSpinner } from '@/app/components/BlockingSpinner'
import { useEffectOnce } from '@/app/utils/useEffectOnce'
import { useWorldRouter, worldRoutes } from '@/router/routes/featureRoutes/worldRoutes'
import { ClientToCalliopeMessageType } from '@/ts-shared/ClientToCalliopeMessage'

import { useAuthCheck } from '../auth/authCheck/useAuthCheck'
import { useEventBusDispatch, useEventBusSubscribe } from '../eventBus'
import { ActorWizardModal } from '../worldTimeline/components/ActorWizard/ActorWizardModal'
import { DeleteEventDeltaModal } from '../worldTimeline/components/EventEditor/components/DeleteEventDeltaModal/DeleteEventDeltaModal'
import { DeleteEventModal } from '../worldTimeline/components/EventEditor/components/DeleteEventModal/DeleteEventModal'
import { RevokedStatementWizard } from '../worldTimeline/components/EventEditor/components/RevokedStatementWizard/RevokedStatementWizard'
import { EventWizardModal } from '../worldTimeline/components/EventWizard/EventWizardModal'
import { Timeline } from '../worldTimeline/components/Timeline/Timeline'
import { TimelinePlaceholder } from '../worldTimeline/components/Timeline/TimelinePlaceholder'
import { useLoadWorldInfo } from '../worldTimeline/hooks/useLoadWorldInfo'
import { WorldDrawer } from './WorldDrawer/WorldDrawer'
import { WorldNavigator } from './WorldNavigator/WorldNavigator'

export const World = () => {
	const { stateOf, isLocationChildOf } = useWorldRouter()
	const { worldId } = stateOf(worldRoutes.root)
	const { success, target } = useAuthCheck()

	const { isLoaded } = useLoadWorldInfo(worldId)

	const sendCalliopeMessage = useEventBusDispatch({ event: 'sendCalliopeMessage' })

	useEffectOnce(() => {
		sendCalliopeMessage({
			type: ClientToCalliopeMessageType.WORLD_SUBSCRIBE,
			data: { worldId },
		})

		return () => {
			sendCalliopeMessage({
				type: ClientToCalliopeMessageType.WORLD_UNSUBSCRIBE,
				data: { worldId },
			})
		}
	})

	useEventBusSubscribe({
		event: 'calliopeReconnected',
		callback: () => {
			sendCalliopeMessage({
				type: ClientToCalliopeMessageType.WORLD_SUBSCRIBE,
				data: { worldId },
			})
		},
	})

	if (!success) {
		return <Navigate to={target} />
	}

	return (
		<>
			<div
				style={{
					position: 'relative',
					width: '100%',
					height: '100vh',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<WorldNavigator />
				<Stack direction="row" width="100%" height="calc(100% - 50.5px)">
					<WorldDrawer />
					<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
						<Outlet />
					</div>
				</Stack>
				{isLocationChildOf(worldRoutes.timeline) && (
					<>
						{isLoaded && <Timeline />}
						{!isLoaded && <TimelinePlaceholder />}
					</>
				)}
				<BlockingSpinner visible={!isLoaded} />
			</div>
			<ActorWizardModal />
			<EventWizardModal />
			<RevokedStatementWizard />
			<DeleteEventModal />
			<DeleteEventDeltaModal />
		</>
	)
}
