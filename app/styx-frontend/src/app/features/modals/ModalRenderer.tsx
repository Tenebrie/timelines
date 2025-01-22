import { Shortcut, useShortcut } from '@/hooks/useShortcut'

import { ArticleWizardModal } from '../worldWiki/modals/ArticleWizardModal'
import { DeleteArticleModal } from '../worldWiki/modals/DeleteArticleModal'
import { useModal } from './reducer'
import { EventTrackEditModal } from './renderers/EventTrackEditModal'
import { EventTrackWizardModal } from './renderers/EventTrackWizardModal'
import { TimeTravelModal } from './renderers/TimeTravelModal'

export const ModalRenderer = () => {
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
