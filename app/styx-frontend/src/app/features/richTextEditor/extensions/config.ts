import CharacterCount from '@tiptap/extension-character-count'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import { HardBreak } from '@tiptap/extension-hard-break'
import ImageExtension from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import { Extensions } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { ExternalImageNode } from './externalImage/ExternalImageNode'
import { MentionNode } from './mentions/components/MentionNode'
import { mentionsSuggestions } from './mentions/MentionsExtension'
import { ThemeAwareTextStyle } from './ThemeAwareTextStyle'

export const SharedExtensions: Extensions = [
	// Starter kit
	StarterKit.configure({
		hardBreak: false,
		undoRedo: false,
	}),
	// Support for hard breaks (Shift + Enter)
	HardBreak.extend({
		addKeyboardShortcuts() {
			return {
				...this?.parent?.(),
				'Mod-Enter': () => false,
			}
		},
	}),
	CharacterCount.configure({
		limit: 32000,
	}),
	// Support for actor mentions
	MentionNode,
	// Image embeds
	ImageExtension,
	ExternalImageNode,
	// Text formatting
	ThemeAwareTextStyle,
	Color,
	FontFamily,
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
