import { useGetMindmapQuery } from '@api/mindmapApi'
import { useGetArticlesQuery } from '@api/worldWikiApi'
import { useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { useModal } from '@/app/features/modals/ModalsSlice'

import { getTimelineState, getWorldState } from '../WorldSliceSelectors'

export function EntityModalReporter() {
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
	const { data: articlesData } = useGetArticlesQuery({ worldId }, { skip: !worldId })

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

		const article = articlesData?.find((a) => a.id === selectedEntityIds[0])
		if (article) {
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
		articlesData,
	])

	return <></>
}
