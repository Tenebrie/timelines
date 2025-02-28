import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

import { ArticleWizardModal } from '../../views/world/views/wiki/modals/ArticleWizardModal'
import { DeleteArticleModal } from '../../views/world/views/wiki/modals/DeleteArticleModal'
import { useModal } from './ModalsSlice'
import { EventTrackEditModal } from './renderers/EventTrackEditModal'
import { EventTrackWizardModal } from './renderers/EventTrackWizardModal'
import { TimeTravelModal } from './renderers/TimeTravelModal'

export const ModalsRenderer = () => {
	const { open: openTimeTravelModal } = useModal('timeTravelModal')

	useShortcut(Shortcut.Search, () => {
		openTimeTravelModal({})
	})

	return (
		<>
			<EventTrackEditModal />
			<EventTrackWizardModal />
			<TimeTravelModal />
			<ArticleWizardModal />
			<DeleteArticleModal />
		</>
	)
}
