import debounce from 'lodash.debounce'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useEffectOnce } from '../useEffectOnce'
import { AutosaveIcon } from './AutosaveIcon'
import { SavingState } from './types'

type Props = {
	onSave: () => void
	isSaving: boolean
}

export const useAutosave = ({ onSave, isSaving }: Props) => {
	const savingStateRef = useRef<SavingState>('none')
	const [savingState, setSavingState] = useState<SavingState>('none')
	const successTimeoutRef = useRef<number | null>(null)

	const onSaveRef = useRef<() => void>(onSave)
	const debouncedAutosave = useRef(
		debounce(() => {
			setSavingState('waiting')
			onSaveRef.current()
		}, 3000)
	)

	const onAutosave = useCallback(() => {
		setSavingState('debounce')
		debouncedAutosave.current()
	}, [])

	const onManualSave = useCallback(() => {
		setSavingState('waiting')
		onSaveRef.current()
	}, [])

	useEffect(() => {
		onSaveRef.current = onSave
	}, [onSave])

	const startedWaitingRef = useRef<boolean>(false)
	useEffect(() => {
		if (savingState === 'waiting' && isSaving && !startedWaitingRef.current) {
			startedWaitingRef.current = true
			return
		}

		if (savingState === 'waiting' && !isSaving && startedWaitingRef.current) {
			startedWaitingRef.current = false
			setSavingState('success')
		}
	}, [savingState, isSaving])

	useEffect(() => {
		savingStateRef.current = savingState
		if (savingState === 'success') {
			successTimeoutRef.current = window.setTimeout(() => {
				setSavingState('none')
				successTimeoutRef.current = null
			}, 3000)
			return
		}

		if (successTimeoutRef.current !== null) {
			window.clearTimeout(successTimeoutRef.current)
			successTimeoutRef.current = null
		}
	}, [savingState])

	const renderIcon = useCallback(() => {
		return <AutosaveIcon savingState={savingState} isSaving={isSaving} />
	}, [isSaving, savingState])

	useEffectOnce(() => {
		return () => {
			if (savingStateRef.current === 'debounce') {
				onSaveRef.current()
			}
		}
	})

	useEffect(() => {
		setCurrentIcon(renderIcon())
		if (savingState === 'success') {
			setCurrentColor('success')
		} else {
			setCurrentColor(undefined)
		}
	}, [renderIcon, savingState])

	const [currentIcon, setCurrentIcon] = useState(renderIcon())
	const [currentColor, setCurrentColor] = useState<'success' | undefined>(undefined)

	return {
		icon: currentIcon,
		color: currentColor,
		autosave: onAutosave,
		manualSave: onManualSave,
		savingState,
	}
}
