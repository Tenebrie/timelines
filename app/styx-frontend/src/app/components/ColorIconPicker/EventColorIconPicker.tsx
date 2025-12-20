import { startTransition, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { EventDraft } from '@/app/components/Outliner/editors/event/details/draft/useEventDraft'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { getEditingPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'

import { ColorIconPicker } from './ColorIconPicker'

type Props = {
	draft: EventDraft
}

export function EventColorIconPicker({ draft }: Props) {
	const { eventColorPickerOpen } = useSelector(
		getEditingPreferences,
		(a, b) => a.eventColorPickerOpen === b.eventColorPickerOpen,
	)

	const { setEventColorPickerOpen } = preferencesSlice.actions
	const dispatch = useDispatch()

	const onClick = useCallback(() => {
		startTransition(() => {
			dispatch(setEventColorPickerOpen(!eventColorPickerOpen))
		})
	}, [dispatch, eventColorPickerOpen, setEventColorPickerOpen])

	return (
		<>
			<ColorIconPicker icon={draft.icon} color={draft.color} onClick={onClick} />
		</>
	)
}
