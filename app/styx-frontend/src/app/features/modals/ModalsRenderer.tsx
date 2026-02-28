import { useSelector } from 'react-redux'

import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { DeleteAccountModal } from '../../views/profile/modals/DeleteAccountModal'
import { DeleteAssetModal } from '../../views/profile/modals/DeleteAssetModal'
import { ArticleWizardModal } from '../../views/world/views/wiki/modals/ArticleWizardModal'
import { DeleteArticleModal } from '../../views/world/views/wiki/modals/DeleteArticleModal'
import { TimeTravelModal } from '../time/timeTravel/TimeTravelModal'
import { useModal } from './ModalsSlice'
import { EventTrackEditModal } from './renderers/EventTrackEditModal'
import { EventTrackWizardModal } from './renderers/EventTrackWizardModal'

export const ModalsRenderer = () => {
	const { isLoaded } = useSelector(getWorldState, (a, b) => a.id === b.id && a.isLoaded === b.isLoaded)
	const { open: openTimeTravelModal } = useModal('timeTravelModal')

	useShortcut(Shortcut.Search, () => {
		if (isLoaded) {
			openTimeTravelModal({})
		}
	})

	return (
		<>
			<EventTrackEditModal />
			<EventTrackWizardModal />
			<TimeTravelModal />
			<ArticleWizardModal />
			<DeleteArticleModal />
			<DeleteAccountModal />
			<DeleteAssetModal />
		</>
	)
}
