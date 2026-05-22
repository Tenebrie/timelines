import { useEditor } from '@tiptap/react'

import { EditorContentBox } from './components/EditorContentBox'
import { ViewerExtensions } from './extensions/editorExtensions'

type Props = {
	value: string
}

export const RichTextEditorReadonly = ({ value }: Props) => {
	const editor = useEditor({
		content: value,
		editable: false,
		extensions: ViewerExtensions,
	})

	if (!editor) {
		return null
	}

	return <EditorContentBox className="content" editor={editor} mode="read" readOnly />
}
