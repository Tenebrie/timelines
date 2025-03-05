import { WorldBrief } from '@api/types/types'
import { UpdateWorldApiArg, useUpdateWorldMutation } from '@api/worldDetailsApi'
import { useCallback, useEffect, useRef } from 'react'

import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useSettingsDraft } from '@/app/views/world/views/settings/hooks/useSettingsDraft'

type Props = {
	world: WorldBrief
	state: ReturnType<typeof useSettingsDraft>
}

export const useEditWorld = ({ world, state }: Props) => {
	const { name, description, calendar, isDirty, setName, setDescription, setCalendar, setDirty } = state

	const lastSavedAt = useRef(new Date(world.updatedAt))

	useEffect(() => {
		if (new Date(world.updatedAt) > lastSavedAt.current) {
			setName(world.name, { cleanSet: true })
			setDescription(world.description, { cleanSet: true })
			setCalendar(world.calendar, { cleanSet: true })

			setDirty(false)
			lastSavedAt.current = new Date(world.updatedAt)
		}
	}, [world, setName, setDescription, setCalendar, setDirty])

	const [updateWorld, { isLoading: isSaving, isError }] = useUpdateWorldMutation()

	const sendUpdate = useCallback(
		async (delta: UpdateWorldApiArg['body']) => {
			setDirty(false)
			const { error } = parseApiResponse(
				await updateWorld({
					worldId: world.id,
					body: delta,
				}),
			)
			if (error) {
				return
			}
			lastSavedAt.current = new Date()
		},
		[world, setDirty, updateWorld],
	)

	const {
		icon: autosaveIcon,
		color: autosaveColor,
		autosave,
		manualSave,
	} = useAutosave({
		onSave: () =>
			sendUpdate({
				name,
				description,
				calendar,
			}),
		isSaving,
		isError,
	})

	useEffect(() => {
		if (isDirty) {
			autosave()
		}
	}, [autosave, isDirty, state])

	return {
		isSaving,
		manualSave,
		autosaveIcon,
		autosaveColor,
	}
}
