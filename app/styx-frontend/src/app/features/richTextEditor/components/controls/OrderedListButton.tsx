import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import { Editor } from '@tiptap/react'
import { useCallback } from 'react'

import { useEditorMarkActive } from '../../hooks/useEditorMarkActive'
import { ToolbarButton } from './ToolbarButton'

type Props = {
	editor: Editor
}

export function OrderedListButton({ editor }: Props) {
	const active = useEditorMarkActive(editor, 'orderedList')

	const onClick = useCallback(() => {
		editor?.chain().focus().toggleOrderedList().run()
	}, [editor])

	return (
		<ToolbarButton tooltip="Numbered list" onClick={onClick} active={active}>
			<FormatListNumberedIcon fontSize="small" />
		</ToolbarButton>
	)
}
