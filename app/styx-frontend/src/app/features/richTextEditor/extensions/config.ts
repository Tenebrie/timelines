import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import { Extensions } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { MentionChip } from './actorMentions/components/ActorMentionNode'
import { mentionsSuggestions } from './actorMentions/MentionsExtension'

export const SharedExtensions: Extensions = [
	// Starter kit
	// TODO: Check which extensions are included
	StarterKit.configure({
		hardBreak: false,
	}),
	// Support for actor mentions
	MentionChip,
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
