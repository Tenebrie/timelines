import { Editor } from '@tiptap/core'
import { SuggestionOptions } from '@tiptap/suggestion'

import { dispatchGlobalEvent } from '@/app/features/eventBus'

export const mentionsSuggestions: Omit<SuggestionOptions, 'editor'> = {
	allowSpaces: true,
	render: () => {
		const state = {
			isOpen: false,
			editor: null as Editor | null,
		}

		return {
			onStart: (props) => {
				if (!props.editor.view.hasFocus()) {
					return
				}
				state.isOpen = true
				state.editor = props.editor
				const pos = props.editor.view.coordsAtPos(props.range.from)
				dispatchGlobalEvent['richEditor/requestOpenMentions']({
					query: props.query,
					screenPosTop: pos.top,
					screenPosBottom: pos.bottom,
					screenPosLeft: pos.left,
				})
			},

			onUpdate(props) {
				const pos = props.editor.view.coordsAtPos(props.range.from)
				dispatchGlobalEvent['richEditor/requestUpdateMentions']({
					query: props.query,
					screenPosTop: pos.top,
					screenPosBottom: pos.bottom,
					screenPosLeft: pos.left,
				})
			},

			onKeyDown(props) {
				if (!state.isOpen || !state.editor) {
					return false
				}
				if (props.event.key === 'Escape') {
					state.isOpen = false
					return true
				}
				if (['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'PageUp', 'PageDown'].includes(props.event.key)) {
					dispatchGlobalEvent['richEditor/onKeyDown']({
						editor: state.editor,
						key: props.event.key,
						ctrlKey: props.event.ctrlKey,
						shiftKey: props.event.shiftKey,
						altKey: props.event.altKey,
						metaKey: props.event.metaKey,
					})
					return true
				}
				return false
			},

			onExit() {
				state.isOpen = false
				dispatchGlobalEvent['richEditor/requestCloseMentions']()
			},
		}
	},
}
