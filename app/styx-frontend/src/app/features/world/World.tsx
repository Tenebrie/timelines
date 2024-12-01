import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Navigate, useOutlet } from 'react-router-dom'
import { CSSTransition, SwitchTransition } from 'react-transition-group'

import { useEffectOnce } from '@/app/utils/useEffectOnce'
import { useLocationRef } from '@/hooks/useLocationRef'
import { QueryParams } from '@/router/routes/QueryParams'
import { useWorldRouter, worldRoutes } from '@/router/routes/worldRoutes'
import { ClientToCalliopeMessageType } from '@/ts-shared/ClientToCalliopeMessage'

import { BlockingSpinner } from '../../components/BlockingSpinner'
import { useAuthCheck } from '../auth/authCheck/useAuthCheck'
import { useEventBusDispatch, useEventBusSubscribe } from '../eventBus'
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
import { useTimelineBusDispatch } from './hooks/useTimelineBus'
import { worldSlice } from './reducer'
import { WorldContainer, WorldContent } from './styles'

const useWatchSelectedTime = () => {
	const { queryOf } = useWorldRouter()

	const scrollTimelineTo = useTimelineBusDispatch()

	const { setSelectedTime } = worldSlice.actions
	const dispatch = useDispatch()

	/**
	 * Selected time has been changed externally
	 */
	useEffect(() => {
		const value = queryOf(worldRoutes.root).time
		const selectedTime = parseInt(value)
		dispatch(setSelectedTime(selectedTime))
		scrollTimelineTo(selectedTime)
	}, [dispatch, setSelectedTime, scrollTimelineTo, queryOf])

	/**
	 * User has pushed the back button
	 */
	const onPopstate = useCallback(() => {
		const url = new URL(window.location.href)
		const value = url.searchParams.get(QueryParams.SELECTED_TIME)
		if (value) {
			const selectedTime = parseInt(value)
			dispatch(setSelectedTime(selectedTime))
			scrollTimelineTo(selectedTime)
		}
	}, [dispatch, scrollTimelineTo, setSelectedTime])

	useEffect(() => {
		window.addEventListener('popstate', onPopstate)
		return () => {
			window.removeEventListener('popstate', onPopstate)
		}
	}, [onPopstate])
}

export const World = () => {
	const { stateOf } = useWorldRouter()
	const { worldId } = stateOf(worldRoutes.root)
	useWatchSelectedTime()

	const { isLoaded } = useLoadWorldInfo(worldId)

	const currentOutlet = useOutlet()
	const { key, nodeRef } = useLocationRef()

	const { success, target } = useAuthCheck()

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
				<WorldContainer>
					<OverviewPanel />
					{/* <WorldDrawer /> */}
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
