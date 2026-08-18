import { isMacOS } from '@tiptap/core'

import { parseInputCombos } from '@/app/utils/parseInputCombos'

export const DragTrigger = {
	Default: 'LMB',
	MoveElements: 'LMB',
	MindmapNodePortWire: 'LMB|Shift+LMB',
	MindmapForceNewWire: 'Shift+LMB',
} as const

export type DragTriggerType = (typeof DragTrigger)[keyof typeof DragTrigger]

const MouseButtons: Record<string, number | undefined> = {
	LMB: 0,
	MMB: 1,
	RMB: 2,
}

export function matchesDragTrigger(event: MouseEvent, trigger: DragTriggerType) {
	const ctrlKey = isMacOS() ? event.metaKey : event.ctrlKey

	return parseInputCombos(trigger).some((keys) => {
		const button = keys.reduce<number>((current, key) => MouseButtons[key] ?? current, 0)

		return (
			event.button === button &&
			ctrlKey === keys.includes('Ctrl') &&
			event.shiftKey === keys.includes('Shift') &&
			event.altKey === keys.includes('Alt')
		)
	})
}
