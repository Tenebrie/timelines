import { useGetWorldCollaboratorsQuery } from '@api/worldCollaboratorsApi'
import { useGetWorldBriefQuery } from '@api/worldDetailsApi'

import { OutlinedContainer } from '@/app/components/OutlinedContainer'

import { WorldDetailsSkeleton } from './components/WorldDetailsSkeleton'
import { WorldDetailsEditor } from './WorldDetailsEditor'

type Props = {
	worldId: string
}

export const WorldDetailsEditorWrapper = ({ worldId }: Props) => {
	const { data: worldData } = useGetWorldBriefQuery({
		worldId,
	})

	const { data: collaboratorsData } = useGetWorldCollaboratorsQuery({
		worldId,
	})

	return (
		<OutlinedContainer label="World details" style={{ minWidth: '600px' }}>
			{worldData && collaboratorsData && (
				<WorldDetailsEditor world={worldData} collaborators={collaboratorsData} />
			)}
			{(!worldData || !collaboratorsData) && <WorldDetailsSkeleton />}
		</OutlinedContainer>
	)
}
