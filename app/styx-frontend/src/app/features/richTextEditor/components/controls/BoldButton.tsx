import { Editor } from '@tiptap/react'
import { useCallback } from 'react'

import { useEditorMarkActive } from '../../hooks/useEditorMarkActive'
import { ToolbarButton } from './ToolbarButton'

type Props = {
	editor: Editor
}

export function BoldButton({ editor }: Props) {
	const active = useEditorMarkActive(editor, 'bold')

	const onClick = useCallback(() => {
		editor?.chain().focus().toggleBold().run()
	}, [editor])

	return (
		<ToolbarButton tooltip="Bold" onClick={onClick} active={active}>
			<b>B</b>
		</ToolbarButton>
	)
}
