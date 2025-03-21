import { SuggestionOptions } from '@tiptap/suggestion'

import { dispatchEvent } from '@/app/features/eventBus'

export const mentionsSuggestions: Omit<SuggestionOptions, 'editor'> = {
	allowSpaces: true,
	render: () => {
		const state = {
			isOpen: false,
		}

		return {
			onStart: (props) => {
				state.isOpen = true
				const pos = props.editor.view.coordsAtPos(props.range.from)
				dispatchEvent({
					event: 'richEditor/requestOpenMentions',
					params: {
						query: props.query,
						screenPosTop: pos.top,
						screenPosLeft: pos.left,
					},
				})
			},

			onUpdate(props) {
				dispatchEvent({
					event: 'richEditor/requestUpdateMentions',
					params: { query: props.query },
				})
			},

			onKeyDown(props) {
				if (!state.isOpen) {
					return false
				}
				if (props.event.key === 'Escape') {
					state.isOpen = false
					dispatchEvent({
						event: 'richEditor/requestCloseMentions',
						params: undefined,
					})
					return true
				}
				if (['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'PageUp', 'PageDown'].includes(props.event.key)) {
					dispatchEvent({
						event: 'richEditor/onKeyDown',
						params: {
							key: props.event.key,
							ctrlKey: props.event.ctrlKey,
							shiftKey: props.event.shiftKey,
							altKey: props.event.altKey,
							metaKey: props.event.metaKey,
						},
					})
					return true
				}
				return false
			},

			onExit() {
				state.isOpen = false
				dispatchEvent({
					event: 'richEditor/requestCloseMentions',
					params: undefined,
				})
			},
		}
	},
}
