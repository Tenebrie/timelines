import { WorldDetails } from '@api/types/worldTypes'
import { useGetWorldCollaboratorsQuery } from '@api/worldCollaboratorsApi'
import { useGetWorldInfoQuery } from '@api/worldDetailsApi'
import { useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { ingestWorld } from '@/app/utils/ingestEntity'

import { Settings } from './Settings'

export const SettingsSuspense = () => {
	const { worldId } = useParams({ from: '/world/$worldId/_world/settings' })
	const { data: rawWorld } = useGetWorldInfoQuery({
		worldId,
	})
	const [worldData, setWorldData] = useState<WorldDetails | null>(null)
	useEffect(() => {
		if (rawWorld) {
			setWorldData(ingestWorld(rawWorld))
		}
	}, [rawWorld])

	const { data: collaboratorsData } = useGetWorldCollaboratorsQuery({
		worldId,
	})

	if (!worldData || !collaboratorsData) {
		return null
	}

	return (
		<OutlinedContainer label="Settings" style={{ minWidth: '600px', borderRadius: '8px' }}>
			<Settings world={worldData} collaborators={collaboratorsData} />
		</OutlinedContainer>
	)
}
