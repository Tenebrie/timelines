import { useGetWorldCollaboratorsQuery, useGetWorldInfoQuery } from '../../../../../api/rheaApi'
import { useWorldRouter } from '../../../world/router'
import { WorldDetailsEditor } from './WorldDetailsEditor'

export const WorldDetails = () => {
	const { worldParams } = useWorldRouter()
	const { worldId } = worldParams

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
