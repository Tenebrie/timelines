import { createTiptapExtensionSchema } from '@neverkin/tiptap-schema'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import { Extensions } from '@tiptap/react'

import { ExternalImageNode } from './externalImage/ExternalImageNode'
import { MentionNode } from './mentions/components/MentionNode'
import { mentionsSuggestions } from './mentions/MentionsExtension'
import { ThemeAwareTextStyle } from './ThemeAwareTextStyle'

export const SharedExtensions: Extensions = [
	...createTiptapExtensionSchema({
		ExternalImageNode,
		MentionNode,
		TextStyle: ThemeAwareTextStyle,
	}),
]

export const EditorExtensions: Extensions = [
	...SharedExtensions,
	Placeholder.configure({
		placeholder: 'Content',
	}),
	Mention.configure({
		suggestion: mentionsSuggestions,
	}),
]

export const ViewerExtensions: Extensions = [...SharedExtensions]
