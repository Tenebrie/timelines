import { useWorldRouter, worldRoutes } from '../../../../../router/routes/worldRoutes'
import { WorldDetailsEditorWrapper } from './WorldDetailsEditorWrapper'

export const WorldDetails = () => {
	const { stateOf } = useWorldRouter()
	const { worldId } = stateOf(worldRoutes.root)

	return <WorldDetailsEditorWrapper worldId={worldId} key={worldId} />
}
