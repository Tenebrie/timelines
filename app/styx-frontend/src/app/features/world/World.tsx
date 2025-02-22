import Stack from '@mui/material/Stack'
import { Outlet } from '@tanstack/react-router'

import { useEffectOnce } from '@/app/utils/useEffectOnce'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'
import { useStrictParams } from '@/router-utils/hooks/useStrictParams'
import { ClientToCalliopeMessageType } from '@/ts-shared/ClientToCalliopeMessage'

import { useEventBusDispatch, useEventBusSubscribe } from '../eventBus'
import { RichTextEditorPortal } from '../richTextEditor/portals/RichTextEditorPortal'
import { ActorWizardModal } from '../worldTimeline/components/ActorWizard/ActorWizardModal'
import { DeleteEventDeltaModal } from '../worldTimeline/components/EventEditor/components/DeleteEventDeltaModal/DeleteEventDeltaModal'
import { DeleteEventModal } from '../worldTimeline/components/EventEditor/components/DeleteEventModal/DeleteEventModal'
import { RevokedStatementWizard } from '../worldTimeline/components/EventEditor/components/RevokedStatementWizard/RevokedStatementWizard'
import { EventWizardModal } from '../worldTimeline/components/EventWizard/EventWizardModal'
import { useLoadWorldInfo } from '../worldTimeline/hooks/useLoadWorldInfo'
import { WorldDrawer } from './WorldDrawer/WorldDrawer'
import { WorldNavigator } from './WorldNavigator/WorldNavigator'

export const World = () => {
	const { worldId } = useStrictParams({
		from: '/world/$worldId',
	})
	const matchesTimeline = useCheckRouteMatch('/world/$worldId/timeline')

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
				{/* {matchesTimeline && ( 
					<>
						{isLoaded && <Timeline />}
						{!isLoaded && <TimelinePlaceholder />}
					</>
				)} */}
				{/* <BlockingSpinner visible={!isLoaded} /> */}
			</div>
			<RichTextEditorPortal />
			<ActorWizardModal />
			<EventWizardModal />
			<RevokedStatementWizard />
			<DeleteEventModal />
			<DeleteEventDeltaModal />
		</>
	)
}
