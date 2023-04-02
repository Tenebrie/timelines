import { Check, MoreHoriz, Save } from '@mui/icons-material'
import debounce from 'lodash.debounce'
import { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
	onSave: () => void
	isSaving: boolean
}

export const useAutosave = ({ onSave, isSaving }: Props) => {
	const [savingState, setSavingState] = useState<'none' | 'debounce' | 'waiting' | 'success'>('none')
	const successTimeoutRef = useRef<number | null>(null)

	const calcIcon = useCallback(() => {
		if (savingState === 'success') {
			return <Check />
		} else if (savingState === 'debounce' || savingState === 'waiting') {
			return <MoreHoriz />
		}
		return <Save />
	}, [savingState])

	const onSaveRef = useRef<() => void>(onSave)
	const debouncedAutosave = useRef(
		debounce(() => {
			setSavingState('waiting')
			onSaveRef.current()
		}, 2000)
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
		if (savingState === 'success') {
			successTimeoutRef.current = window.setTimeout(() => {
				setSavingState('none')
				successTimeoutRef.current = null
			}, 1500)
			return
		}

		if (successTimeoutRef.current !== null) {
			window.clearTimeout(successTimeoutRef.current)
			successTimeoutRef.current = null
		}
	}, [savingState])

	useEffect(() => {
		setCurrentIcon(calcIcon())
	}, [calcIcon, savingState])

	const [currentIcon, setCurrentIcon] = useState(calcIcon())

	return {
		icon: currentIcon,
		autosave: onAutosave,
		manualSave: onManualSave,
	}
}
