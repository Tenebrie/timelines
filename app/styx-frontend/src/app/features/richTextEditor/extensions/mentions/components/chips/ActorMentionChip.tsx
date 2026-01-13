import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { BaseMentionChip } from './BaseMentionChip'

type Props = {
	worldId: string
	actorId: string
	actors: ReturnType<typeof getWorldState>['actors']
}

export const ActorMentionChip = ({ actorId, actors }: Props) => {
	const navigateTo = useEventBusDispatch['world/requestNavigation']()

	const actor = actors.find((actor) => actor.id === actorId)
	const actorName = actor ? `${actor.name}` : 'Unknown Actor'
	const actorColor = actor ? actor.color : undefined

	const onClick = () => {
		if (!actor) {
			return
		}
		navigateTo({
			search: (prev) => {
				const selection = [...(prev.selection ?? [])] as string[]
				if (selection[selection.length - 1] !== actorId) {
					selection.push(actorId)
				}
				return { ...prev, selection }
			},
		})
	}

	return <BaseMentionChip type="Actor" label={actorName} color={actorColor} onClick={onClick} />
}
