import { WorldEvent } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useRouter } from '@tanstack/react-router'
import { memo } from 'react'

import { ColorPicker } from '@/app/components/ColorPicker/ColorPicker'
import { IconPicker } from '@/app/components/IconPicker/IconPicker'
import { useUpsertEvent } from '@/app/components/Outliner/editors/event/details/draft/useUpsertEvent'
import { useCurrentOrNewEvent } from '@/app/components/Outliner/editors/event/details/hooks/useCurrentOrNewEvent'
import { EntityEditorTabs } from '@/app/features/entityEditor/components/EntityEditorTabs'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { EventDescription } from './components/EventDescription'
import { EventTitle } from './components/EventTitle'
import { useEventDraft } from './draft/useEventDraft'

type Props = {
	editedEvent: WorldEvent | null
	autoFocus?: boolean
}

export const EventDetails = memo(EventDetailsComponent)

export function EventDetailsComponent({ editedEvent, autoFocus }: Props) {
	const { mode, event } = useCurrentOrNewEvent({ event: editedEvent })
	const draft = useEventDraft({ event })
	const navigate = useStableNavigate({ from: '/world/$worldId/timeline' })
	const router = useRouter()

	useUpsertEvent({
		mode,
		draft,
		onCreate: (createdEvent) => {
			const navi = router.state.location.search.navi
			if (!navi || navi.length === 0 || navi[navi.length - 1] !== draft.id) {
				return
			}
			navigate({
				to: '/world/$worldId/timeline',
				search: (prev) => ({ ...prev, navi: [`issuedAt-${createdEvent.id}`] }),
			})
		},
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
			<Box flexGrow={1} height={0}>
				<EntityEditorTabs
					contentTab={<EventDescription draft={draft} autoFocus={autoFocus} />}
					illustrationTab={
						<Stack gap={2} sx={{ height: '100%', overflow: 'auto', marginRight: -0.5 }}>
							<Stack gap={2} sx={{ marginRight: 2 }}>
								<ColorPicker key={draft.id} initialValue={draft.color} onChangeHex={draft.setColor} />
								<IconPicker color={draft.color} defaultQuery={draft.icon} onSelect={draft.setIcon} />
							</Stack>
						</Stack>
					}
				/>
			</Box>
		</Stack>
	)
}
