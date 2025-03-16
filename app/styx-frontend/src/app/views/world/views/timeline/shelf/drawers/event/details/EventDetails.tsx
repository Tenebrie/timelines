import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useNavigate } from '@tanstack/react-router'
import { memo } from 'react'
import { useSelector } from 'react-redux'

import { ColorPicker } from '@/app/components/ColorPicker/ColorPicker'
import { getEditingPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { useUpsertEvent } from '@/app/views/world/views/timeline/shelf/drawers/event/details/draft/useUpsertEvent'
import { useCurrentOrNewEvent } from '@/app/views/world/views/timeline/shelf/drawers/event/details/hooks/useCurrentOrNewEvent'

import { EventDescription } from './components/EventDescription'
import { EventTitle } from './components/EventTitle'
import { useEventDraft } from './draft/useEventDraft'

export const EventDetails = memo(EventDetailsComponent)

export function EventDetailsComponent() {
	const { mode, event } = useCurrentOrNewEvent()
	const draft = useEventDraft({ event })
	const navigate = useNavigate({ from: '/world/$worldId/timeline' })
	const { eventColorPickerOpen } = useSelector(
		getEditingPreferences,
		(a, b) => a.eventColorPickerOpen === b.eventColorPickerOpen,
	)

	useUpsertEvent({
		mode,
		draft,
		onCreate: (createdEvent) => {
			navigate({
				to: '/world/$worldId/timeline',
				search: (prev) => ({ ...prev, selection: [`issuedAt-${createdEvent.id}`] }),
			})
		},
	})

	return (
		<Stack
			gap={1}
			sx={{
				padding: '24px 16px',
				overflowY: 'auto',
				...useBrowserSpecificScrollbars(),
			}}
		>
			<EventTitle event={event} draft={draft} />
			<Divider />
			<Box sx={{ paddingBottom: eventColorPickerOpen ? 1 : 0, transition: 'padding 300ms' }}>
				<Collapse
					in={eventColorPickerOpen}
					sx={{ overflow: 'hidden' }}
					timeout={300}
					easing={'ease-in-out'}
					mountOnEnter
					unmountOnExit
				>
					<ColorPicker key={draft.id} initialValue={draft.color} onChangeHex={draft.setColor} />
				</Collapse>
			</Box>
			<Box flexGrow={1} sx={{ marginTop: -1, height: 0 }}>
				<EventDescription draft={draft} />
			</Box>
		</Stack>
	)
}
