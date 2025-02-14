import { useEffect, useRef, useState } from 'react'

import { EventDraft } from '../useEventFields'

type Props = {
	mode: 'create' | 'edit'
	draft: EventDraft
}

const storageKey = 'createEvent/savedState'

const prepareState = (state: EventDraft) => ({
	name: state.name,
	description: state.description,
	descriptionRich: state.descriptionRich,
	timestamp: state.timestamp,
	icon: state.icon,
	mentions: state.mentions,
	externalLink: state.externalLink,
	customNameEnabled: state.customNameEnabled,
	revokedAt: state.revokedAt,
	extraFields: state.modules,
})

const saveState = (state: EventDraft) => {
	sessionStorage.setItem(storageKey, JSON.stringify(prepareState(state)))
}

const loadState = () => {
	const savedItem = sessionStorage.getItem(storageKey)
	if (!savedItem) {
		return null
	}
	return JSON.parse(savedItem) as ReturnType<typeof prepareState>
}

export const usePreserveCreateState = ({ mode, draft }: Props) => {
	const stateRef = useRef(draft)
	const [hasLoaded, setHasLoaded] = useState(false)

	useEffect(() => {
		stateRef.current = draft
	}, [draft])

	useEffect(() => {
		const loadedState = loadState()
		if (!loadedState || mode !== 'create') {
			setHasLoaded(true)
			return
		}

		draft.loadState(loadedState)

		sessionStorage.removeItem(storageKey)
		setHasLoaded(true)
	}, [hasLoaded, draft, mode])

	useEffect(() => {
		if (!hasLoaded || mode !== 'create') {
			return
		}

		const handleSave = () => saveState(stateRef.current)
		window.addEventListener('beforeunload', handleSave)

		return () => {
			window.removeEventListener('beforeunload', handleSave)
			saveState(stateRef.current)
		}
	}, [hasLoaded, mode])
}
