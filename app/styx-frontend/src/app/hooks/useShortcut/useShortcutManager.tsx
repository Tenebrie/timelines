import { isMacOS } from '@tiptap/core'
import { useCallback, useEffect } from 'react'

export const Shortcut = {
	Enter: 'Enter',
	CtrlEnter: 'Ctrl+Enter',
	Search: 't',
	Escape: 'Escape',
	CreateNew: 'n',
	TracksMenu: 'r',
	ScrollTimelineLeft: 'j',
	ScrollTimelineRight: 'l',
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
	[Shortcut.CreateNew]: [],
	[Shortcut.TracksMenu]: [],
	[Shortcut.ScrollTimelineLeft]: [],
	[Shortcut.ScrollTimelineRight]: [],
}

export const useShortcutManager = () => {
	const parsePriority = (priority: ShortcutPriority) => {
		return priority === true ? 1 : priority === false ? -1 : Number(priority)
	}

	const onKeyDown = useCallback((event: KeyboardEvent) => {
		const key = event.key
		if (!key) {
			return
		}
		const ctrlKey = isMacOS() ? event.metaKey : event.ctrlKey

		const isTargetingInput =
			event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement
		const isTargetingRichInput = event.target instanceof HTMLElement && event.target.isContentEditable
		const isSingleKeyShortcut = key.length === 1

		if (isSingleKeyShortcut && (isTargetingInput || isTargetingRichInput)) {
			return
		}

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
