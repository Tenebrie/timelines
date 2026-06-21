import { ActorDraft } from '@/app/features/entityEditor/actor/details/draft/useActorDraft'

import { ColorIconPicker } from './ColorIconPicker'

type Props = {
	draft: ActorDraft
}

export function ActorColorIconPicker({ draft }: Props) {
	return (
		<ColorIconPicker icon={draft.icon} defaultIcon="mdi:person" color={draft.color} onClick={() => null} />
	)
}
