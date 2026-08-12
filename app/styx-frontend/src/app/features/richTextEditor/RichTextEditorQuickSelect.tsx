import { MentionNodeName } from '@neverkin/tiptap-schema'
import { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import { useCallback } from 'react'

import { QuickSelectList } from '@/app/components/QuickSelectList/QuickSelectList'

type Props = {
	editor: Editor | null
}

export function RichTextEditorQuickSelect({ editor }: Props) {
	const onSelect = useCallback(
		({ query, entity }: Parameters<Parameters<typeof QuickSelectList>[0]['onSelect']>[0]) => {
			if (!editor) {
				return
			}
			const { id, type, name } = entity
			editor
				.chain()
				.focus()
				.deleteRange({
					from: editor.state.selection.from - query.length - 1,
					to: editor.state.selection.from,
				})
				.insertContent({
					type: MentionNodeName,
					attrs: {
						type: 'mention',
						name,
						componentProps: {
							[type.toLowerCase()]: id,
						},
					},
				})
				.run()
		},
		[editor],
	)

	const isFocused = useEditorState({
		editor,
		selector: ({ editor }) => editor?.isFocused ?? false,
	})

	if (!editor) {
		return null
	}

	return <QuickSelectList isFocused={isFocused ?? false} onSelect={onSelect} />
}
