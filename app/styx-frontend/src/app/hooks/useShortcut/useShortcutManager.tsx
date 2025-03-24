import { isMacOS } from '@tiptap/core'
import { useCallback, useEffect } from 'react'

export const Shortcut = {
	Enter: 'Enter',
	CtrlEnter: 'Ctrl+Enter',
	Search: 't',
	Escape: 'Escape',
	CreateNew: 'n',
	EditSelected: 'e',
	DeleteSelected: 'Delete|macos:Backspace',
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
	[Shortcut.EditSelected]: [],
	[Shortcut.DeleteSelected]: [],
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
			const defKeys = shortcut
				.split('|')
				.filter((part) => {
					if (part.startsWith('macos:')) {
						return isMacOS()
					}
					return true
				})
				.map((part) => {
					const colonIndex = part.indexOf(':')
					return colonIndex === -1 ? part : part.slice(colonIndex + 1)
				})
				.flatMap((part) => part.split('+'))
			const ctrlKeyNeeded = defKeys.some((key) => key === 'Ctrl')

			if (ctrlKey === ctrlKeyNeeded && defKeys.includes(key)) {
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
