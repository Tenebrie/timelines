import { ActorDetails } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import { memo } from 'react'
import { useSelector } from 'react-redux'

import { useDragDrop } from '@/app/features/dragDrop/hooks/useDragDrop'
import { getOutlinerPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { ActorNodeContent } from '@/app/views/world/views/mindmap/workspace/ActorNodeContent'

import { ActorWithContentRenderer } from './OutlinerItemActor/ActorWithContentRenderer'

export const OutlinerItemActor = memo(OutlinerItemActorComponent)

type Props = {
	actor: ActorDetails
}

function OutlinerItemActorComponent({ actor }: Props) {
	const { expandedActors } = useSelector(
		getOutlinerPreferences,
		(a, b) => a.expandedActors === b.expandedActors,
	)

	const { ghostElement, ref } = useDragDrop({
		type: 'newMindmapNode',
		params: {
			actor,
		},
		ghostFactory: () => (
			<Box sx={{ borderRadius: 2, filter: 'grayscale(1)' }}>
				<ActorNodeContent actor={actor} onHeaderClick={() => {}} onContentClick={() => {}} />
			</Box>
		),
	})

	return (
		<>
			<Box ref={ref}>
				<ActorWithContentRenderer
					collapsed={!expandedActors.includes(actor.id)}
					actor={actor}
					divider={true}
				/>
			</Box>
			{ghostElement}
		</>
	)
}
