import Box from '@mui/material/Box'
import { useEditor } from '@tiptap/react'

import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'

import { EditorContentBox } from './components/EditorContentBox'
import { ViewerExtensions } from './extensions/editorExtensions'

type Props = {
	value: string
}

export const RichTextEditorReadonly = ({ value }: Props) => {
	const scrollbars = useBrowserSpecificScrollbars()
	const editor = useEditor({
		content: value,
		editable: false,
		extensions: ViewerExtensions,
	})

	if (!editor) {
		return null
	}

	return (
		<Box sx={{ overflowY: 'auto', ...scrollbars }}>
			<EditorContentBox className="content" editor={editor} mode="read" readOnly />
		</Box>
	)
}
