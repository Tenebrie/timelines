import { useEffect, useRef, useState } from 'react'

import { useEventFields } from '../useEventFields'

type Props = {
	mode: 'create' | 'create-compact' | 'edit'
	state: ReturnType<typeof useEventFields>['state']
	onLoaded: () => void
}

const storageKey = 'createEvent/savedState'

const prepareState = (state: Props['state']) => ({
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

const saveState = (state: Props['state']) => {
	sessionStorage.setItem(storageKey, JSON.stringify(prepareState(state)))
}

const loadState = () => {
	const savedItem = sessionStorage.getItem(storageKey)
	if (!savedItem) {
		return null
	}
	return JSON.parse(savedItem) as ReturnType<typeof prepareState>
}

export const usePreserveCreateState = ({ mode, state, onLoaded }: Props) => {
	const stateRef = useRef(state)
	const [hasLoaded, setHasLoaded] = useState(false)

	useEffect(() => {
		stateRef.current = state
	}, [state])

	useEffect(() => {
		if (mode === 'edit' || hasLoaded) {
			return
		}

		const loadedState = loadState()
		if (!loadedState) {
			setHasLoaded(true)
			return
		}

		state.loadState(loadedState)

		sessionStorage.removeItem(storageKey)
		setHasLoaded(true)
		onLoaded()
	}, [mode, hasLoaded, state, onLoaded])

	useEffect(() => {
		if (!hasLoaded) {
			return
		}

		const handleSave = () => saveState(stateRef.current)
		window.addEventListener('beforeunload', handleSave)

		return () => {
			window.removeEventListener('beforeunload', handleSave)
			saveState(stateRef.current)
		}
	}, [hasLoaded])
}
