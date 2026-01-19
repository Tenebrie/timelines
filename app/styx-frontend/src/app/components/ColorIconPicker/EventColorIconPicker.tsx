import { EventDraft } from '@/app/components/Outliner/editors/event/details/draft/useEventDraft'

import { ColorIconPicker } from './ColorIconPicker'

type Props = {
	draft: EventDraft
}

export function EventColorIconPicker({ draft }: Props) {
	return <ColorIconPicker icon={draft.icon} color={draft.color} onClick={() => {}} />
}
