import { startTransition, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ActorDraft } from '@/app/components/Outliner/editors/actor/details/draft/useActorDraft'
import { useEventBusDispatch } from '@/app/features/eventBus'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { getEditingPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'

import { ColorIconPicker } from './ColorIconPicker'

type Props = {
	draft: ActorDraft
}

export function ActorColorIconPicker({ draft }: Props) {
	const { actorColorPickerOpen } = useSelector(
		getEditingPreferences,
		(a, b) => a.actorColorPickerOpen === b.actorColorPickerOpen,
	)

	const openEventDrawer = useEventBusDispatch({ event: 'timeline/eventEditor/requestOpen' })
	const { setActorColorPickerOpen } = preferencesSlice.actions
	const dispatch = useDispatch()

	const onClick = useCallback(() => {
		startTransition(() => {
			dispatch(setActorColorPickerOpen(!actorColorPickerOpen))
		})
		openEventDrawer({ extraHeight: actorColorPickerOpen ? -135 : 135 })
	}, [dispatch, actorColorPickerOpen, openEventDrawer, setActorColorPickerOpen])

	return (
		<>
			<ColorIconPicker icon={''} color={draft.color} onClick={onClick} />
		</>
	)
}
