import { useEditor } from '@tiptap/react'

import { ViewerExtensions } from './extensions/config'
import { StyledEditorContent } from './styles'

type Props = {
	value: string
}

export const RichTextEditorReadonly = ({ value }: Props) => {
	const editor = useEditor({
		content: value,
		editable: false,
		extensions: ViewerExtensions,
	})

	return (
		<div>
			<StyledEditorContent className="content" editor={editor} readOnly $mode="read" />
		</div>
	)
}
