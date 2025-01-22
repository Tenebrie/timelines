import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Editor } from '@tiptap/react'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { getWikiPreferences } from '../preferences/selectors'
import { ReadModeToggle } from '../worldWiki/components/ReadModeToggle/ReadModeToggle'
import { ActiveButtonIndicator } from './extensions/actorMentions/components/ActiveButtonIndicator'

type Props = {
	editor: Editor | null
	allowReadMode?: boolean
}

export const RichTextEditorControls = ({ editor, allowReadMode }: Props) => {
	const { readModeEnabled } = useSelector(getWikiPreferences)

	const isReadMode = readModeEnabled && allowReadMode

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
			<Stack direction="row" justifyContent="space-between">
				<Stack direction="row" gap={1}>
					{!isReadMode && (
						<>
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
						</>
					)}
					{isReadMode && (
						<Stack sx={{ height: '100%', alignItems: 'center' }} direction="row">
							<Typography variant="body2" color="gray" sx={{ fontStyle: 'italic' }}>
								Read mode
							</Typography>
						</Stack>
					)}
				</Stack>
				{allowReadMode && <ReadModeToggle />}
			</Stack>
		</Paper>
	)
}
