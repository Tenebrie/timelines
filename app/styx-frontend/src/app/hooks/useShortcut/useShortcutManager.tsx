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
	NudgeLeft: 'ArrowLeft',
	NudgeRight: 'ArrowRight',
	LargeNudgeLeft: 'Shift+ArrowLeft',
	LargeNudgeRight: 'Shift+ArrowRight',
	AscendMarkerTrack: 'ArrowUp',
	DescendMarkerTrack: 'ArrowDown',
} as const

/**
 * Predefined priority levels for shortcuts.
 * Higher priority shortcuts are executed first when multiple handlers are registered for the same key.
 */
export const ShortcutPriorities = {
	/** Default priority for most shortcuts */
	Default: 0,
	/** Disabled - shortcut will not be executed */
	Disabled: -1,
	/** Modal dialogs (should be closable before mentions menu) */
	Modal: 10,
	/** Input fields being edited (should be closable before modal closes) */
	InputField: 11,
	/** Mentions/autocomplete dropdowns (should be closable before modal) */
	Mentions: 20,
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
	[Shortcut.NudgeLeft]: [],
	[Shortcut.NudgeRight]: [],
	[Shortcut.LargeNudgeLeft]: [],
	[Shortcut.LargeNudgeRight]: [],
	[Shortcut.AscendMarkerTrack]: [],
	[Shortcut.DescendMarkerTrack]: [],
}

export const useShortcutManager = () => {
	const parsePriority = (priority: ShortcutPriority) => {
		return priority === true ? 1 : priority === false ? -1 : Number(priority)
	}

	const onKeyDown = useCallback((event: KeyboardEvent) => {
		const key = event.key
		if (!key || key === 'Ctrl' || key === 'Shift' || key === 'Alt' || key === 'Meta') {
			return
		}
		const ctrlKey = isMacOS() ? event.metaKey : event.ctrlKey
		const shiftKey = event.shiftKey

		const isTargetingInput =
			event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement
		const isTargetingRichInput = event.target instanceof HTMLElement && event.target.isContentEditable
		const isSingleKeyShortcut = key.length === 1

		if (isSingleKeyShortcut && (isTargetingInput || isTargetingRichInput)) {
			return
		}

		Object.values(Shortcut).forEach((shortcut) => {
			if (shortcut === Shortcut.DeleteSelected && (isTargetingInput || isTargetingRichInput)) {
				return
			}
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
			const shiftKeyNeeded = defKeys.some((key) => key === 'Shift')

			if (ctrlKey === ctrlKeyNeeded && shiftKey === shiftKeyNeeded && defKeys.includes(key)) {
				const callback = RegisteredShortcuts[shortcut]
					.filter((shc) => shc.priority !== false)
					.sort((a, b) => parsePriority(b.priority) - parsePriority(a.priority))[0]
				if (callback) {
					callback.callback()
					event.preventDefault()
				}
			}
		})
	}, [])

	useEffect(() => {
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [onKeyDown])
}
