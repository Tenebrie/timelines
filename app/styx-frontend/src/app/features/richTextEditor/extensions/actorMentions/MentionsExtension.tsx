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
					event: 'richEditor/openMentions',
					params: {
						query: props.query,
						screenPosTop: pos.top,
						screenPosLeft: pos.left,
					},
				})
			},

			onUpdate(props) {
				dispatchEvent({
					event: 'richEditor/updateMentions',
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
						event: 'richEditor/closeMentions',
						params: undefined,
					})
					return true
				}
				if (['ArrowUp', 'ArrowDown', 'Enter'].includes(props.event.key)) {
					dispatchEvent({
						event: 'richEditor/keyDown',
						params: {
							key: props.event.key,
						},
					})
					return true
				}
				return false
			},

			onExit() {
				state.isOpen = false
				dispatchEvent({
					event: 'richEditor/closeMentions',
					params: undefined,
				})
			},
		}
	},
}
