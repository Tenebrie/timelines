import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import { Editor } from '@tiptap/react'
import { useCallback } from 'react'

import { useEditorMarkActive } from '../../hooks/useEditorMarkActive'
import { ToolbarButton } from './ToolbarButton'

type Props = {
	editor: Editor
}

export function BlockquoteButton({ editor }: Props) {
	const active = useEditorMarkActive(editor, 'blockquote')

	const onClick = useCallback(() => {
		editor?.chain().focus().toggleBlockquote().run()
	}, [editor])

	return (
		<ToolbarButton tooltip="Blockquote" onClick={onClick} active={active}>
			<FormatQuoteIcon fontSize="small" />
		</ToolbarButton>
	)
}
