import { startTransition, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { preferencesSlice } from '@/app/features/preferences/reducer'
import { getEditingPreferences } from '@/app/features/preferences/selectors'
import { EventDraft } from '@/app/features/worldTimeline/components/EventEditor/components/EventDetailsEditor/useEventFields'

import { ColorIconPicker } from './ColorIconPicker'

type Props = {
	draft: EventDraft
}

export function EventColorIconPicker({ draft }: Props) {
	const { eventColorPickerOpen } = useSelector(
		getEditingPreferences,
		(a, b) => a.eventColorPickerOpen === b.eventColorPickerOpen,
	)

	const openEventDrawer = useEventBusDispatch({ event: 'timeline/openEventDrawer' })
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
