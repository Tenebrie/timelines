import { Stack } from '@mui/material'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import { Editor } from '@tiptap/react'
import { useCallback } from 'react'

import { ActiveButtonIndicator } from './extensions/actorMentions/components/ActiveButtonIndicator'

type Props = {
	editor: Editor | null
}

export const RichTextEditorControls = ({ editor }: Props) => {
	const isBold = editor?.isActive('bold') ?? false
	const isItalic = editor?.isActive('italic') ?? false

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
		<Paper sx={{ padding: '4px 8px' }}>
			<Stack direction="row" gap={1}>
				<Button onClick={onBoldClick} color="secondary">
					Bold
					<ActiveButtonIndicator active={isBold} />
				</Button>
				<Button onClick={onItalicClick} color="secondary">
					Italic
					<ActiveButtonIndicator active={isItalic} />
				</Button>
				<Button onClick={onMentionActorClick} color="secondary">
					@Actor
				</Button>
			</Stack>
		</Paper>
	)
}
