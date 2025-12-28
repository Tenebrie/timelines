import { useEventBusDispatch } from '@/app/features/eventBus'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { BaseMentionChip } from './BaseMentionChip'

type Props = {
	worldId: string
	actorId: string
	actors: ReturnType<typeof getWorldState>['actors']
}

export const ActorMentionChip = ({ worldId, actorId, actors }: Props) => {
	const navigateTo = useEventBusDispatch({
		event: 'world/requestNavigation',
	})
	const { open: openEditActorModal } = useModal('editActorModal')

	const actor = actors.find((actor) => actor.id === actorId)
	const actorName = actor ? `${actor.name}` : 'Unknown Actor'
	const actorColor = actor ? actor.color : undefined

	const onClick = () => {
		if (!actor) {
			return
		}
		navigateTo({
			search: (prev) => ({ ...prev, selection: [actorId] }),
		})
		openEditActorModal({ actorId: actor.id })
	}

	return <BaseMentionChip type="Actor" label={actorName} color={actorColor} onClick={onClick} />
}
