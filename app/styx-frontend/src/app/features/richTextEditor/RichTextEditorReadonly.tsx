import { useEditor } from '@tiptap/react'

import { ViewerExtensions } from './extensions/config'
import { EditorContentBox } from './RichTextEditor'

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
