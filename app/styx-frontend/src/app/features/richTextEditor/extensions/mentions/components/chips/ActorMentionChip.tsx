import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldState } from '@/app/features/world/selectors'

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
			to: '/world/$worldId/timeline/actor/$actorId',
			params: { worldId, actorId },
		})
	}

	return <BaseMentionChip type="Actor" label={actorName} color={actorColor} onClick={onClick} />
}
