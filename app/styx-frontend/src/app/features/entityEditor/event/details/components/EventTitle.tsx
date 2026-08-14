import { WorldEvent } from '@api/types/worldTypes'
import Stack from '@mui/material/Stack'
import useEvent from 'react-use-event-hook'

import { EventColorIconPicker } from '@/app/components/ColorIconPicker/EventColorIconPicker'
import { EditableTitle } from '@/ui-lib/components/EditableTitle/EditableTitle'

import { EventDraft } from '../draft/useEventDraft'
import { EventTimePopover } from './EventTimePopover'

type Props = {
	event: WorldEvent
	draft: EventDraft
	titleProps?: Partial<Parameters<typeof EditableTitle>[0]>
}

export const EventTitle = ({ event, draft, titleProps }: Props) => {
	const onSave = useEvent((name: string) => {
		draft.setName(name.trim())
	})

	return (
		<EditableTitle
			value={draft.name}
			displayValue={draft.name || event.name || '<Unnamed>'}
			onSave={onSave}
			endAdornment={<EventTimePopover draft={draft} />}
			placeholder="Custom name"
			{...titleProps}
			startAdornment={
				<Stack sx={{ height: 1 }} direction="row">
					{titleProps?.startAdornment}
					<EventColorIconPicker draft={draft} />
				</Stack>
			}
		/>
	)
}
