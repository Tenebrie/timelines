import { startTransition, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { getEditingPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { EventDraft } from '@/app/views/world/views/timeline/shelf/drawers/event/details/draft/useEventDraft'

import { ColorIconPicker } from './ColorIconPicker'

type Props = {
	draft: EventDraft
}

export function EventColorIconPicker({ draft }: Props) {
	const { eventColorPickerOpen } = useSelector(
		getEditingPreferences,
		(a, b) => a.eventColorPickerOpen === b.eventColorPickerOpen,
	)

	const openEventDrawer = useEventBusDispatch({ event: 'timeline/eventDrawer/requestOpen' })
	const { setEventColorPickerOpen } = preferencesSlice.actions
	const dispatch = useDispatch()

	const onClick = useCallback(() => {
		startTransition(() => {
			dispatch(setEventColorPickerOpen(!eventColorPickerOpen))
		})
		openEventDrawer({ extraHeight: eventColorPickerOpen ? -135 : 135 })
	}, [dispatch, eventColorPickerOpen, openEventDrawer, setEventColorPickerOpen])

	return (
		<>
			<ColorIconPicker icon={draft.icon} color={draft.color} onClick={onClick} />
		</>
	)
}
