import { ActorDraft } from '@/app/components/Outliner/editors/actor/details/draft/useActorDraft'

import { ColorIconPicker } from './ColorIconPicker'

type Props = {
	draft: ActorDraft
}

export function ActorColorIconPicker({ draft }: Props) {
	return <ColorIconPicker icon={draft.icon} color={draft.color} onClick={() => {}} />
}
