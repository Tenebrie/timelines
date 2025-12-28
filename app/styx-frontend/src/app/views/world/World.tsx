import Stack from '@mui/material/Stack'
import { Outlet } from '@tanstack/react-router'

import { RichTextEditorWithFallback } from '@/app/features/richTextEditor/RichTextEditorWithFallback'
import { useEffectOnce } from '@/app/utils/useEffectOnce'
import { useStrictParams } from '@/router-utils/hooks/useStrictParams'
import { ClientToCalliopeMessageType } from '@/ts-shared/ClientToCalliopeMessage'

import { useEventBusDispatch, useEventBusSubscribe } from '../../features/eventBus'
import { SummonableRichTextEditor } from '../../features/richTextEditor/portals/RichTextEditorPortal'
import { WorldSidebar } from './components/sidebar/WorldSidebar'
import { WorldNavigator } from './components/WorldNavigator'
import { useLoadWorldInfo } from './hooks/useLoadWorldInfo'
import { DeleteEventDeltaModal } from './modals/DeleteEventDeltaModal'
import { DeleteEventModal } from './modals/DeleteEventModal'
import { EditActorModal } from './modals/EditActorModal'
import { EditEventModal } from './modals/EditEventModal'

export const World = () => {
	const { worldId } = useStrictParams({
		from: '/world/$worldId',
	})
	const sendCalliopeMessage = useEventBusDispatch({ event: 'calliope/requestSendMessage' })

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
		event: 'calliope/onReconnected',
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
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<WorldNavigator />
				<Stack direction="row" width="100%" height="100%">
					<WorldSidebar />
					<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
						<Outlet />
					</div>
				</Stack>
			</div>
			<SummonableRichTextEditor>
				{(props) => <RichTextEditorWithFallback {...props} />}
			</SummonableRichTextEditor>
			<SummonableRichTextEditor>
				{(props) => <RichTextEditorWithFallback {...props} />}
			</SummonableRichTextEditor>
			<WorldLoader />
			<EditActorModal />
			<EditEventModal />
			<DeleteEventModal />
			<DeleteEventDeltaModal />
		</>
	)
}

function WorldLoader() {
	const { worldId } = useStrictParams({
		from: '/world/$worldId',
	})
	useLoadWorldInfo(worldId)
	return <></>
}
