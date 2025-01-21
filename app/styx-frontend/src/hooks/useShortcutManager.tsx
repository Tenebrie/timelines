import { useCallback, useEffect } from 'react'

import { isMacOS } from '../app/utils/isMacOS'

export const Shortcut = {
	Enter: 'Enter',
	CtrlEnter: 'Ctrl+Enter',
	Search: 'Ctrl+f',
	Escape: 'Escape',
} as const

export type ShortcutPriority = number | boolean

export const RegisteredShortcuts: Record<
	(typeof Shortcut)[keyof typeof Shortcut],
	{ priority: ShortcutPriority; callback: () => unknown }[]
> = {
	[Shortcut.Enter]: [],
	[Shortcut.CtrlEnter]: [],
	[Shortcut.Search]: [],
	[Shortcut.Escape]: [],
}

export const useShortcutManager = () => {
	const parsePriority = (priority: ShortcutPriority) => {
		return priority === true ? 1 : priority === false ? -1 : Number(priority)
	}

	const onKeyDown = useCallback((event: KeyboardEvent) => {
		const key = event.key
		const ctrlKey = isMacOS() ? event.metaKey : event.ctrlKey

		Object.values(Shortcut).forEach((shortcut) => {
			const defKeys = shortcut.split('+')
			const ctrlKeyNeeded = defKeys.some((key) => key === 'Ctrl')

			if (ctrlKey === ctrlKeyNeeded && key === defKeys[defKeys.length - 1]) {
				RegisteredShortcuts[shortcut]
					.filter((shc) => shc.priority !== false)
					.sort((a, b) => parsePriority(b.priority) - parsePriority(a.priority))[0]
					?.callback()
				event.preventDefault()
			}
		})
	}, [])

	useEffect(() => {
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [onKeyDown])
}
