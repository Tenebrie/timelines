import { useCallback, useEffect } from 'react'

import { isMacOS } from '../app/utils/isMacOS'

export const Shortcut = {
	Enter: 'Enter',
	CtrlEnter: 'Ctrl+Enter',
	Search: 'Ctrl+f',
} as const

export const RegisteredShortcuts: Record<
	(typeof Shortcut)[keyof typeof Shortcut],
	{ priority: number; callback: () => unknown }[]
> = {
	[Shortcut.Enter]: [],
	[Shortcut.CtrlEnter]: [],
	[Shortcut.Search]: [],
}

export const useShortcutManager = () => {
	const onKeyDown = useCallback((event: KeyboardEvent) => {
		const key = event.key
		const ctrlKey = isMacOS() ? event.metaKey : event.ctrlKey

		Object.values(Shortcut).forEach((shortcut) => {
			const defKeys = shortcut.split('+')
			const ctrlKeyNeeded = defKeys.some((key) => key === 'Ctrl')

			if (ctrlKey === ctrlKeyNeeded && key === defKeys[defKeys.length - 1]) {
				RegisteredShortcuts[shortcut].sort((a, b) => b.priority - a.priority)[0]?.callback()
				event.preventDefault()
			}
		})
	}, [])

	useEffect(() => {
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [onKeyDown])
}
