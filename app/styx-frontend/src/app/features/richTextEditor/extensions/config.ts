import { HardBreak } from '@tiptap/extension-hard-break'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import { Extensions } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { MentionNode } from './mentions/components/MentionNode'
import { mentionsSuggestions } from './mentions/MentionsExtension'

export const SharedExtensions: Extensions = [
	// Starter kit
	// TODO: Check which extensions are included
	StarterKit.configure({
		hardBreak: false,
	}),
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
