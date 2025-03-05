import Stack from '@mui/material/Stack'
import { useEffect, useMemo } from 'react'

import { RegisteredShortcuts, ShortcutPriority } from './useShortcutManager'
import { Shortcut } from './useShortcutManager'

export { Shortcut }

export const useShortcut = (
	shortcutOrArray: (typeof Shortcut)[keyof typeof Shortcut] | (typeof Shortcut)[keyof typeof Shortcut][],
	callback: () => void,
	priority?: ShortcutPriority,
) => {
	useEffect(() => {
		const shortcuts = Array.isArray(shortcutOrArray) ? shortcutOrArray : [shortcutOrArray]
		shortcuts.forEach((shortcut) => {
			RegisteredShortcuts[shortcut].push({
				callback,
				priority: priority ?? 0,
			})
		})
		return () => {
			shortcuts.forEach((shortcut) => {
				RegisteredShortcuts[shortcut] = RegisteredShortcuts[shortcut].filter((cb) => cb.callback !== callback)
			})
		}
	}, [callback, priority, shortcutOrArray])

	const label = useMemo(() => {
		const shortcuts = Array.isArray(shortcutOrArray) ? shortcutOrArray : [shortcutOrArray]
		return shortcuts.join(' / ')
	}, [shortcutOrArray])

	const largeLabel = useMemo(() => {
		const shortcuts = Array.isArray(shortcutOrArray) ? shortcutOrArray : [shortcutOrArray]
		return shortcuts.map((shortcut) => (
			<Stack sx={{ alignItems: 'center', justifyContent: 'center', fontSize: '12px' }} key={shortcut}>
				{shortcut}
			</Stack>
		))
	}, [shortcutOrArray])

	return {
		label,
		largeLabel,
	}
}
