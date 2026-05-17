import { Extensions } from '@tiptap/core'
import CharacterCount from '@tiptap/extension-character-count'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import { HardBreak } from '@tiptap/extension-hard-break'
import ImageExtension from '@tiptap/extension-image'
import { TextStyle } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'

import { ExternalImageNode } from './nodes/ExternalImageNode.js'
import { MentionNode } from './nodes/MentionNode.js'

export const BaseExtensions = {
	StarterKit: StarterKit.configure({
		hardBreak: false,
		undoRedo: false,
	}),
	CharacterCount: CharacterCount.configure({
		limit: 32000,
	}),

	// Support for hard breaks (Shift + Enter)
	HardBreak: HardBreak.extend({
		addKeyboardShortcuts() {
			return {
				...this?.parent?.(),
				'Mod-Enter': () => false,
			}
		},
	}),

	// Support for entity mentions
	MentionNode,

	// Image embeds
	ImageExtension,
	ExternalImageNode,

	// Text formatting
	TextStyle,
	Color,
	FontFamily,
} as const

export function createTiptapExtensionSchema(overrides: Partial<typeof BaseExtensions> = {}): Extensions {
	const merged = {
		...BaseExtensions,
		...overrides,
	}
	return Object.values(merged) as Extensions
}
