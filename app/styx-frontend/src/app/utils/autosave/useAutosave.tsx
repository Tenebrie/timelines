import debounce from 'lodash.debounce'
import { useCallback, useEffect, useRef, useState } from 'react'

import { isRunningInTest } from '../../../jest/isRunningInTest'
import { useEffectOnce } from '../useEffectOnce'
import { AutosaveIcon } from './AutosaveIcon'
import { SavingState } from './types'

type Props = {
	onSave: () => void
	isSaving: boolean
	isError?: boolean
}

export const useAutosave = ({ onSave, isSaving, isError }: Props) => {
	const savingStateRef = useRef<SavingState>('none')
	const [savingState, setSavingState] = useState<SavingState>('none')
	const successTimeoutRef = useRef<number | null>(null)

	const autosaveDelay = isRunningInTest() ? 1000 : 3000

	const onSaveRef = useRef<() => void>(onSave)
	const debouncedAutosave = useRef(
		debounce(() => {
			if (savingStateRef.current !== 'debounce') {
				return
			}
			setSavingState('waiting')
			onSaveRef.current()
		}, autosaveDelay)
	)

	const onAutosave = useCallback(() => {
		setSavingState('debounce')
		debouncedAutosave.current()
	}, [])

	const onManualSave = useCallback(() => {
		if (isSaving) {
			return
		}
		setSavingState('waiting')
		onSaveRef.current()
	}, [isSaving])

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
			setSavingState(isError ? 'error' : 'success')
		}
	}, [savingState, isSaving, isError])

	useEffect(() => {
		savingStateRef.current = savingState
		if (savingState === 'success' || savingState === 'error') {
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

	const [currentIcon, setCurrentIcon] = useState(renderIcon())
	const [currentColor, setCurrentColor] = useState<'success' | 'error' | undefined>(undefined)

	useEffect(() => {
		setCurrentIcon(renderIcon())
		if (isError) {
			setCurrentColor('error')
		} else if (savingState === 'success') {
			setCurrentColor('success')
		} else {
			setCurrentColor(undefined)
		}
	}, [renderIcon, isError, savingState])

	return {
		icon: currentIcon,
		color: currentColor,
		autosave: onAutosave,
		manualSave: onManualSave,
		savingState,
	}
}
