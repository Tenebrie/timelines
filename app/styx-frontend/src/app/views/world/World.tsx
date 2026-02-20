import { useGetMindmapQuery } from '@api/mindmapApi'
import Stack from '@mui/material/Stack'
import { Outlet, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { useModal } from '@/app/features/modals/ModalsSlice'
import { RichTextEditorWithFallback } from '@/app/features/richTextEditor/RichTextEditorWithFallback'
import { useEffectOnce } from '@/app/utils/useEffectOnce'
import { useStrictParams } from '@/router-utils/hooks/useStrictParams'
import { ClientToCalliopeMessageType } from '@/ts-shared/ClientToCalliopeMessage'

import { useEventBusDispatch, useEventBusSubscribe } from '../../features/eventBus'
import { SummonableRichTextEditor } from '../../features/richTextEditor/portals/RichTextEditorPortal'
import { WorldSidebar } from './components/sidebar/WorldSidebar'
import { useLoadWorldInfo } from './hooks/useLoadWorldInfo'
import { CreateActorModal } from './modals/CreateActorModal'
import { CreateEventModal } from './modals/CreateEventModal'
import { DeleteEventDeltaModal } from './modals/DeleteEventDeltaModal'
import { DeleteEventModal } from './modals/DeleteEventModal'
import { EditEventModal } from './modals/editEventModal/EditEventModal'
import { MarkerTooltipSummoner } from './views/timeline/MarkerTooltip'
import { getTimelineState, getWorldState } from './WorldSliceSelectors'

export const World = () => {
	const { worldId } = useStrictParams({
		from: '/world/$worldId/_world',
	})
	const sendCalliopeMessage = useEventBusDispatch['calliope/requestSendMessage']()

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

	useEventBusSubscribe['calliope/onReconnected']({
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
				key={worldId}
				style={{
					position: 'relative',
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					overflow: 'hidden',
				}}
			>
				<Stack direction="row" width="100%" height="100%">
					<WorldSidebar />
					<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
						<Outlet />
					</div>
				</Stack>
			</div>
			{Array(3)
				.fill(0)
				.map((_, index) => (
					<SummonableRichTextEditor key={index}>
						{(props) => <RichTextEditorWithFallback {...props} />}
					</SummonableRichTextEditor>
				))}
			<WorldLoader />
			<EditEventModal />
			<DeleteEventModal />
			<DeleteEventDeltaModal />
			<EntityModalReporter />
			<MarkerTooltipSummoner />
			<CreateEventModal />
			<CreateActorModal />
		</>
	)
}

function WorldLoader() {
	const { worldId } = useStrictParams({
		from: '/world/$worldId/_world',
	})
	useLoadWorldInfo(worldId)
	return <></>
}

function EntityModalReporter() {
	const { isOpen, open, close } = useModal('editEventModal')
	const { open: openCreateEventModal, close: closeCreateEventModal } = useModal('createEventModal')
	const { open: openCreateActorModal, close: closeCreateActorModal } = useModal('createActorModal')
	const { selectedEntityIds, creatingNew } = useSearch({
		from: '/world/$worldId/_world',
		select: (search) => ({ selectedEntityIds: search.navi, creatingNew: search.new }),
	})
	const {
		id: worldId,
		events,
		actors,
		tags,
	} = useSelector(
		getWorldState,
		(a, b) => a.id === b.id && a.events === b.events && a.actors === b.actors && a.tags === b.tags,
	)
	const { data: mindmapData } = useGetMindmapQuery({ worldId }, { skip: !worldId })
	const { markers } = useSelector(getTimelineState, (a, b) => a.markers === b.markers)

	useEffect(() => {
		if (selectedEntityIds.length === 0 && !creatingNew) {
			close()
			closeCreateEventModal()
			closeCreateActorModal()
			return
		}

		const event = events.find((e) => e.id === selectedEntityIds[0])
		if (event) {
			closeCreateEventModal()
			closeCreateActorModal()
			open({ entityStack: selectedEntityIds, creatingNew: null })
			return
		}

		const tag = tags.find((t) => t.id === selectedEntityIds[0])
		if (tag) {
			closeCreateEventModal()
			closeCreateActorModal()
			open({ entityStack: selectedEntityIds, creatingNew: null })
			return
		}

		const marker = markers.find((m) => m.key === selectedEntityIds[0])
		if (marker) {
			const event = events.find((e) => e.id === marker.eventId)
			if (event) {
				closeCreateEventModal()
				closeCreateActorModal()
				open({ entityStack: selectedEntityIds, creatingNew: null })
				return
			}
		}

		const node = mindmapData?.nodes.find((n) => n.id === selectedEntityIds[0])
		if (node) {
			const actor = actors.find((e) => e.id === node.parentActorId)
			if (actor) {
				closeCreateEventModal()
				closeCreateActorModal()
				open({ entityStack: selectedEntityIds, creatingNew: null })
				return
			}
		}

		const actor = actors.find((a) => a.id === selectedEntityIds[0])
		if (actor) {
			closeCreateEventModal()
			closeCreateActorModal()
			open({ entityStack: selectedEntityIds, creatingNew: null })
			return
		}

		if (creatingNew === 'event') {
			openCreateEventModal({})
			return
		}

		if (creatingNew === 'actor') {
			openCreateActorModal({})
			return
		}
	}, [
		actors,
		close,
		closeCreateEventModal,
		closeCreateActorModal,
		creatingNew,
		events,
		isOpen,
		markers,
		mindmapData?.nodes,
		open,
		openCreateEventModal,
		openCreateActorModal,
		selectedEntityIds,
		tags,
	])

	return <></>
}
