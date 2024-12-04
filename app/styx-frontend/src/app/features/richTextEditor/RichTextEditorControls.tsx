import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import { Editor } from '@tiptap/react'
import { useCallback } from 'react'

type Props = {
	editor: Editor | null
}

export const RichTextEditorControls = ({ editor }: Props) => {
	const onBoldClick = useCallback(() => {
		editor?.chain().focus().toggleBold().run()
	}, [editor])

	const onItalicClick = useCallback(() => {
		editor?.chain().focus().toggleItalic().run()
	}, [editor])

	const onMentionActorClick = useCallback(() => {
		if (!editor) {
			return
		}

		const pos = editor.state.selection.$head.pos
		if (editor.state.doc.textBetween(pos - 1, pos) !== ' ') {
			editor.chain().focus().insertContent(' ').run()
		}
		editor.chain().focus().insertContent('@').run()
	}, [editor])

	return (
		<Paper>
			<Button onClick={onBoldClick}>Bold</Button>
			<Button onClick={onItalicClick}>Italic</Button>
			<Button onClick={onMentionActorClick}>@Actor</Button>
		</Paper>
	)
}
