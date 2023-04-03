import { useCallback, useEffect, useMemo } from 'react'

import { ShortcutLabel } from './styles'

export const Shortcut = {
	Enter: 'Enter',
	CtrlEnter: 'Ctrl+Enter',
} as const

export const useShortcut = (shortcut: (typeof Shortcut)[keyof typeof Shortcut], callback: () => void) => {
	const defKeys = useMemo(() => shortcut.split('+'), [shortcut])
	const ctrlKeyNeeded = useMemo(() => defKeys.some((key) => key === 'Ctrl'), [defKeys])

	const onKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const key = event.key
			const ctrlKey = event.ctrlKey

			if (ctrlKey === ctrlKeyNeeded && key === defKeys[defKeys.length - 1]) {
				callback()
			}
		},
		[callback, ctrlKeyNeeded, defKeys]
	)

	useEffect(() => {
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [onKeyDown, shortcut])

	return {
		label: shortcut,
		largeLabel: <ShortcutLabel>{shortcut}</ShortcutLabel>,
	}
}
