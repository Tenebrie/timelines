import { Editor } from '@tiptap/react'
import { useCallback } from 'react'

import { useEditorMarkActive } from '../../hooks/useEditorMarkActive'
import { ToolbarButton } from './ToolbarButton'

type Props = {
	editor: Editor
}

export function StrikethroughButton({ editor }: Props) {
	const active = useEditorMarkActive(editor, 'strike')

	const onClick = useCallback(() => {
		editor?.chain().focus().toggleStrike().run()
	}, [editor])

	return (
		<ToolbarButton
			tooltip="Strikethrough"
			onClick={onClick}
			active={active}
			sx={{ textDecoration: 'line-through !important' }}
		>
			S
		</ToolbarButton>
	)
}
