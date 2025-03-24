import { useGetWorldCollaboratorsQuery } from '@api/worldCollaboratorsApi'
import { useGetWorldBriefQuery } from '@api/worldDetailsApi'
import Stack from '@mui/material/Stack'
import { useParams } from '@tanstack/react-router'

import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { LoadingSpinner } from '@/app/features/skeleton/LoadingSpinner'

import { Settings } from './Settings'

export const SettingsSuspense = () => {
	const { worldId } = useParams({ from: '/world/$worldId/_world/settings' })
	const { data: worldData } = useGetWorldBriefQuery({
		worldId,
	})

	const { data: collaboratorsData } = useGetWorldCollaboratorsQuery({
		worldId,
	})

	return (
		<OutlinedContainer label="Settings" style={{ minWidth: '600px', borderRadius: '8px' }}>
			{worldData && collaboratorsData && <Settings world={worldData} collaborators={collaboratorsData} />}
			{(!worldData || !collaboratorsData) && <SettingsSkeleton />}
		</OutlinedContainer>
	)
}

const SettingsSkeleton = () => {
	return (
		<Stack alignItems="center" justifyContent="center">
			<LoadingSpinner />
		</Stack>
	)
}
