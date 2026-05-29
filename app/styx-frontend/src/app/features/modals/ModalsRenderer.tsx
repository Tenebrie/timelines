import { useSelector } from 'react-redux'

import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { DeleteAssetModal } from '../../views/profile/modals/DeleteAssetModal'
import { EventTracksModal } from '../../views/world/views/timeline/tracks/track/EventTracksModal'
import { ArticleWizardModal } from '../../views/world/views/wiki/modals/ArticleWizardModal'
import { DeleteArticleModal } from '../../views/world/views/wiki/modals/DeleteArticleModal'
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

	useShortcut(
		Shortcut.Search,
		() => {
			openTimeTravelModal({})
		},
		isLoaded,
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
			<ArticleWizardModal />
			<DeleteArticleModal />
			<DeleteAssetModal />
		</>
	)
}
