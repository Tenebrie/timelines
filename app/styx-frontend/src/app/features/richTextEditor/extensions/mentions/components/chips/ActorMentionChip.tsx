import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { BaseMentionChip } from './BaseMentionChip'

type Props = {
	worldId: string
	actorId: string
	actors: ReturnType<typeof getWorldState>['actors']
}

export const ActorMentionChip = ({ worldId, actorId, actors }: Props) => {
	const navigateTo = useEventBusDispatch({
		event: 'navigate/world',
	})

	const actor = actors.find((actor) => actor.id === actorId)
	const actorName = actor ? `${actor.name}` : 'Unknown Actor'
	const actorColor = actor ? actor.color : undefined

	const onClick = () => {
		if (!actor) {
			return
		}

		navigateTo({
			to: '/world/$worldId/mindmap',
			params: { worldId },
			search: (prev) => ({ ...prev, selection: [actor.id] }),
		})
	}

	return <BaseMentionChip type="Actor" label={actorName} color={actorColor} onClick={onClick} />
}
