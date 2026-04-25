import { WorldEvent } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { memo } from 'react'

import { ColorPicker } from '@/app/components/ColorPicker/ColorPicker'
import { IconPicker } from '@/app/components/IconPicker/IconPicker'
import { EntityEditorTabs } from '@/app/features/entityEditor/common/EntityEditorTabs'
import { useUpsertEvent } from '@/app/features/entityEditor/event/details/draft/useUpsertEvent'
import { useCurrentOrNewEvent } from '@/app/features/entityEditor/event/details/hooks/useCurrentOrNewEvent'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'

import { EventBacklinks } from './components/EventBacklinks'
import { EventDescription } from './components/EventDescription'
import { EventTitle } from './components/EventTitle'
import { useEventDraft } from './draft/useEventDraft'

type Props = {
	editedEvent: WorldEvent
	autoFocus?: boolean
}

export const EventDetails = memo(EventDetailsComponent)

export function EventDetailsComponent({ editedEvent, autoFocus }: Props) {
	const { event } = useCurrentOrNewEvent({ event: editedEvent })
	const draft = useEventDraft({ event })

	useUpsertEvent({
		draft,
	})

	return (
		<Stack
			gap={1}
			sx={{
				height: '100%',
				...useBrowserSpecificScrollbars(),
			}}
		>
			<EventTitle event={event} draft={draft} />
			<Divider />
			<Box flexGrow={1} height={0}>
				<EntityEditorTabs
					contentTab={<EventDescription event={event} autoFocus={autoFocus} />}
					illustrationTab={
						<Stack gap={2} sx={{ height: '100%', overflow: 'auto', marginLeft: 1, marginRight: -0.5 }}>
							<Stack gap={2} sx={{ marginRight: 2 }}>
								<ColorPicker
									key={'color-' + draft.id + '-' + draft.key}
									initialValue={draft.color}
									onChangeHex={draft.setColor}
								/>
								<IconPicker
									key={'icon-' + draft.id}
									color={draft.color}
									defaultQuery={draft.icon}
									onSelect={draft.setIcon}
								/>
							</Stack>
						</Stack>
					}
					backlinksTab={<EventBacklinks eventId={event.id} />}
				/>
			</Box>
		</Stack>
	)
}
