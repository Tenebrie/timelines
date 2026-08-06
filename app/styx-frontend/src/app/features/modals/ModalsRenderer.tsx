import { useSelector } from 'react-redux'

import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

import { DeleteAssetModal } from '../../views/profile/modals/DeleteAssetModal'
import { EventTracksModal } from '../../views/world/views/timeline/tracks/track/EventTracksModal'
import { DeleteArticleModal } from '../../views/world/views/wiki/modals/DeleteArticleModal'
import { RenameFolderModal } from '../../views/world/views/wiki/modals/RenameFolderModal'
import { TimeTravelModal } from '../time/timeTravel/TimeTravelModal'
import { useModal } from './ModalsSlice'

export const ModalsRenderer = () => {
	const { isLoaded } = useSelector(getWorldState, (a, b) => a.id === b.id && a.isLoaded === b.isLoaded)
	const { open: openTimeTravelModal } = useModal('timeTravelModal')
	const {
		isOpen: isEventTracksModalOpen,
		open: openEventTracksModal,
		close: closeEventTracksModal,
	} = useModal('eventTracks')
	const { selectedTime, selectedTimelineMarkers } = useSelector(
		getWorldState,
		(a, b) => a.selectedTimelineMarkers === b.selectedTimelineMarkers,
	)

	const isTimelineRoute = useCheckRouteMatch('/world/$worldId/timeline')
	useShortcut(
		Shortcut.Search,
		() => {
			openTimeTravelModal({ startingTime: selectedTime, markers: selectedTimelineMarkers })
		},
		isLoaded && isTimelineRoute,
	)

	useShortcut(
		Shortcut.TracksMenu,
		() => {
			if (isEventTracksModalOpen) {
				closeEventTracksModal()
			} else {
				openEventTracksModal({})
			}
		},
		isLoaded,
	)

	return (
		<>
			<EventTracksModal />
			<TimeTravelModal />
			<DeleteArticleModal />
			<RenameFolderModal />
			<DeleteAssetModal />
		</>
	)
}
