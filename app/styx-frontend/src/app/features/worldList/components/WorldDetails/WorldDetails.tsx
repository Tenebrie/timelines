import { homeRoutes, useHomeRouter } from '@/router/routes/homeRoutes'

import { WorldDetailsEditorWrapper } from './WorldDetailsEditorWrapper'

export const WorldDetails = () => {
	const { stateOf } = useHomeRouter()
	const worldId = stateOf(homeRoutes.worldDetails).worldId

	return <WorldDetailsEditorWrapper worldId={worldId} key={worldId} />
}
