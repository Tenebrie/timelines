import { Editor, useEditorState } from '@tiptap/react'

export function useEditorMarkActive(editor: Editor, markName: string) {
	return (
		useEditorState({
			editor,
			selector: (ctx) => ctx.editor?.isActive(markName) ?? false,
		}) ?? false
	)
}
