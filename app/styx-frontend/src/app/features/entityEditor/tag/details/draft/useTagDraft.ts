import { WorldTag } from '@api/types/worldTypes'
import { useCallback, useMemo, useRef, useState } from 'react'

import { generateSetter } from '@/app/utils/autosave/generateSetter'

type Props = {
	tag: WorldTag
}

export type TagDraft = ReturnType<typeof useTagDraft>

export const useTagDraft = ({ tag }: Props) => {
	const [isDirty, setDirty] = useState(false)
	const makeDirty = () => setDirty(true)

	const currentId = useRef(tag.id)
	const currentUpdatedAt = useRef(tag.updatedAt)
	const [key, setKey] = useState(0)
	const [id, setIdDirect] = useState<string>(tag.id)
	const [worldId, setWorldIdDirect] = useState<string>(tag.worldId)
	const [name, setNameDirect] = useState<string>(tag.name)

	const setters = useMemo(
		() => ({
			setId: generateSetter(setIdDirect, makeDirty),
			setWorldId: generateSetter(setWorldIdDirect, makeDirty),
			setName: generateSetter(setNameDirect, makeDirty),
		}),
		[],
	)

	const loadState = useCallback(
		(loadedState: { id: string; worldId: string; name: string }) => {
			setDirty(false)
			setters.setId(loadedState.id, { cleanSet: true })
			setters.setWorldId(loadedState.worldId, { cleanSet: true })
			setters.setName(loadedState.name, { cleanSet: true })
			setKey((prev) => prev + 1)
		},
		[setters],
	)

	const loadTag = useCallback(
		(tag: WorldTag) => {
			currentId.current = tag.id
			currentUpdatedAt.current = tag.updatedAt
			loadState(tag)
		},
		[loadState],
	)

	const toPayload = useCallback(() => {
		return {
			name,
		}
	}, [name])

	if (currentId.current !== tag.id) {
		loadTag(tag)
	}

	if (currentId.current === tag.id && tag.updatedAt > currentUpdatedAt.current) {
		loadTag(tag)
	}

	return {
		isDirty,
		key,
		id,
		worldId,
		name,
		setDirty,
		...setters,
		loadState,
		loadTag,
		resetUpdatedAt: (updatedAt: string) => {
			currentUpdatedAt.current = updatedAt
		},
		toPayload,
	}
}
