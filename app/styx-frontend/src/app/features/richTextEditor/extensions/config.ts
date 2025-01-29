import DropcursorExtension from '@tiptap/extension-dropcursor'
import { HardBreak } from '@tiptap/extension-hard-break'
import ImageExtension from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { Extensions } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { MentionNode } from './mentions/components/MentionNode'
import { mentionsSuggestions } from './mentions/MentionsExtension'

export const SharedExtensions: Extensions = [
	// Starter kit
	StarterKit.configure({
		hardBreak: false,
	}),
	// Support for underlined text
	Underline,
	// Support for hard breaks (Shift + Enter)
	HardBreak.extend({
		addKeyboardShortcuts() {
			return {
				...this?.parent?.(),
				'Mod-Enter': () => false,
			}
		},
	}),
	// Support for actor mentions
	MentionNode,
	// Image embeds
	ImageExtension,
	// Drop cursor (ghost cursor when dragging)
	DropcursorExtension,
]

export const EditorExtensions: Extensions = [
	...SharedExtensions,
	// Placeholder for empty content
	Placeholder.configure({
		placeholder: 'Content',
	}),
	// Actor mentions menu
	Mention.configure({
		suggestion: mentionsSuggestions,
	}),
]

export const ViewerExtensions: Extensions = [...SharedExtensions]
