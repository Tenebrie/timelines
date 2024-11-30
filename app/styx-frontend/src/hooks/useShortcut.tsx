import { useEffect } from 'react'

import { ShortcutLabel } from './styles'
import { RegisteredShortcuts } from './useShortcutManager'
import { Shortcut } from './useShortcutManager'

export { Shortcut }

export const useShortcut = (
	shortcut: (typeof Shortcut)[keyof typeof Shortcut],
	callback: () => void,
	priority?: number,
) => {
	useEffect(() => {
		RegisteredShortcuts[shortcut].push({
			callback,
			priority: priority ?? 0,
		})
		return () => {
			RegisteredShortcuts[shortcut] = RegisteredShortcuts[shortcut].filter((cb) => cb.callback !== callback)
		}
	}, [callback, priority, shortcut])

	return {
		label: shortcut,
		largeLabel: <ShortcutLabel>{shortcut}</ShortcutLabel>,
	}
}
