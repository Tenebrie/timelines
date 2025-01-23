import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldState } from '@/app/features/world/selectors'
import { worldTimelineRoutes } from '@/router/routes/featureRoutes/worldTimelineRoutes'
import { QueryParams } from '@/router/routes/QueryParams'
import { QueryStrategy } from '@/router/types'

import { BaseMentionChip } from './BaseMentionChip'

type Props = {
	actorId: string
}

export const ActorMentionChip = ({ actorId }: Props) => {
	const { id: worldId, actors } = useSelector(getWorldState, (a, b) => a.id === b.id && a.actors === b.actors)
	const navigateTo = useEventBusDispatch({
		event: 'navigate/worldTimeline',
	})

	const actor = actors.find((actor) => actor.id === actorId)
	const actorName = actor ? `@${actor.name}` : '@Unknown Actor'
	const actorColor = actor ? actor.color : undefined

	return (
		<BaseMentionChip
			label={actorName}
			color={actorColor}
			onClick={() =>
				navigateTo({
					target: worldTimelineRoutes.actorEditor,
					args: { worldId, actorId },
					query: { [QueryParams.SELECTED_TIME]: QueryStrategy.Preserve },
				})
			}
		/>
	)
}
