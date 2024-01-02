import { useGetWorldCollaboratorsQuery, useGetWorldInfoQuery } from '../../../../../api/rheaApi'
import { useWorldRouter, worldRoutes } from '../../../../../router/routes/worldRoutes'
import { WorldDetailsEditor } from './WorldDetailsEditor'

export const WorldDetails = () => {
	const { stateOf } = useWorldRouter()
	const { worldId } = stateOf(worldRoutes.root)

	const { data: worldData } = useGetWorldInfoQuery({
		worldId,
	})

	const { data: collaboratorsData } = useGetWorldCollaboratorsQuery({
		worldId,
	})

	if (!worldData || !collaboratorsData) {
		return <></>
	}

	return (
		<>
			<WorldDetailsEditor world={worldData} collaborators={collaboratorsData} />
		</>
	)
}
