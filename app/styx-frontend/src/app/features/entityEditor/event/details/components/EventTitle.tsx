import { WorldEvent } from '@api/types/worldTypes'
import useEvent from 'react-use-event-hook'

import { EventColorIconPicker } from '@/app/components/ColorIconPicker/EventColorIconPicker'
import { EditableTitle } from '@/ui-lib/components/EditableTitle/EditableTitle'

import { EventDraft } from '../draft/useEventDraft'
import { EventTimePopover } from './EventTimePopover'

type Props = {
	event: WorldEvent
	draft: EventDraft
}

export const EventTitle = ({ event, draft }: Props) => {
	const onSave = useEvent((name: string) => {
		draft.setName(name.trim())
	})

	return (
		<EditableTitle
			value={draft.name}
			displayValue={draft.name || event.name || '<Unnamed>'}
			onSave={onSave}
			startAdornment={<EventColorIconPicker draft={draft} />}
			endAdornment={<EventTimePopover draft={draft} />}
			placeholder="Custom name"
		/>
	)
}
