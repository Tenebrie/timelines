import { startTransition, useCallback } from 'react'

import { EventDraft } from '@/app/features/worldTimeline/components/EventEditor/components/EventDetailsEditor/useEventFields'

import { ColorIconPicker } from './ColorIconPicker'

type Props = {
	draft: EventDraft
}

export function EventColorIconPicker({ draft }: Props) {
	const onClick = useCallback(() => {
		startTransition(() => {
			draft.setEditingColors(!draft.editingColors)
		})
	}, [draft])

	return (
		<>
			<ColorIconPicker icon={draft.icon} color={draft.color} onClick={onClick} />
		</>
	)
}
