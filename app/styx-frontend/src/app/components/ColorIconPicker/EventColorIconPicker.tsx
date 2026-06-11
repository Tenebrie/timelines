import { EventDraft } from '@/app/features/entityEditor/event/details/draft/useEventDraft'

import { ColorIconPicker } from './ColorIconPicker'

type Props = {
	draft: EventDraft
}

export function EventColorIconPicker({ draft }: Props) {
	return (
		<ColorIconPicker icon={draft.icon} defaultIcon="mdi:event" color={draft.color} onClick={() => null} />
	)
}
