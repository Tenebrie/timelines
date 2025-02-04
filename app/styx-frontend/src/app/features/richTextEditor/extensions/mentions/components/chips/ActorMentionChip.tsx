import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldState } from '@/app/features/world/selectors'
import { worldTimelineRoutes } from '@/router/routes/featureRoutes/worldTimelineRoutes'
import { QueryParams } from '@/router/routes/QueryParams'
import { QueryStrategy } from '@/router/types'

import { BaseMentionChip } from './BaseMentionChip'

type Props = {
	worldId: string
	actorId: string
	actors: ReturnType<typeof getWorldState>['actors']
}

export const ActorMentionChip = ({ worldId, actorId, actors }: Props) => {
	const navigateTo = useEventBusDispatch({
		event: 'navigate/worldTimeline',
	})

	const actor = actors.find((actor) => actor.id === actorId)
	const actorName = actor ? `${actor.name}` : 'Unknown Actor'
	const actorColor = actor ? actor.color : undefined

	const onClick = () => {
		if (!actor) {
			return
		}
		navigateTo({
			target: worldTimelineRoutes.actorEditor,
			args: { worldId, actorId },
			query: { [QueryParams.SELECTED_TIME]: QueryStrategy.Preserve },
		})
	}

	return <BaseMentionChip type="Actor" label={actorName} color={actorColor} onClick={onClick} />
}
