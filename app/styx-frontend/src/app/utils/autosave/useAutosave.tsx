import Save from '@mui/icons-material/Save'
import throttle from 'lodash.throttle'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import { useAutoRef } from '@/app/hooks/useAutoRef'
import { isRunningInTest } from '@/test-utils/isRunningInTest'

import { useEffectOnce } from '../useEffectOnce'
import { AutosaveIcon } from './AutosaveIcon'
import { SavingState } from './types'

type Props<T extends unknown[]> = {
	onSave: (...args: T) => void
	isSaving: boolean
	isError?: boolean
	defaultIcon?: ReactElement
}

export const useAutosave = <T extends unknown[]>({ onSave, isSaving, isError, defaultIcon }: Props<T>) => {
	const savingStateRef = useRef<SavingState>('none')
	const [savingState, setSavingState] = useState<SavingState>('none')
	const successTimeoutRef = useRef<number | null>(null)
	const defaultIconRef = useRef<ReactElement | undefined>(defaultIcon)

	// TODO: Figure out a more permanent solution
	const autosaveDelay = isRunningInTest() ? 300 : 1000

	const onSaveRef = useAutoRef(onSave)
	const isSavingRef = useAutoRef(isSaving)
	const debouncedAutosave = useRef(
		throttle((...args: T) => {
			if (savingStateRef.current !== 'debounce') {
				return
			}
			if (isSavingRef.current) {
				debouncedAutosave.current(...args)
				return
			}
			setSavingState('waiting')
			onSaveRef.current(...args)
			lastSeenValue.current = null
		}, autosaveDelay),
	)

	const lastSeenValue = useRef<T | null>(null)
	const onAutosave = useCallback((...args: T) => {
		setSavingState('debounce')
		lastSeenValue.current = args
		debouncedAutosave.current(...args)
	}, [])

	const onFlushSave = useCallback(() => {
		if (savingStateRef.current === 'debounce' && lastSeenValue.current) {
			// onSaveRef.current(...lastSeenValue.current)
			debouncedAutosave.current.flush()
			// lastSeenValue.current = null
			setSavingState('none')
		}
	}, [])

	const onManualSave = useCallback(
		(...args: T) => {
			if (isSavingRef.current) {
				return
			}
			setSavingState('waiting')
			onSaveRef.current(...args)
			lastSeenValue.current = null
		},
		[isSavingRef, onSaveRef],
	)

	const onCancelAutosave = useCallback(() => {
		setSavingState('none')
		lastSeenValue.current = null
	}, [])

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
		return (
			<AutosaveIcon
				savingState={savingState}
				isSaving={isSaving}
				defaultIcon={defaultIconRef.current ?? <Save />}
			/>
		)
	}, [isSaving, savingState])

	useEffectOnce(() => {
		return () => {
			if (savingStateRef.current === 'debounce' && lastSeenValue.current) {
				onSaveRef.current(...lastSeenValue.current)
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
		flushSave: onFlushSave,
		manualSave: onManualSave,
		cancelAutosave: onCancelAutosave,
		savingState,
	}
}
