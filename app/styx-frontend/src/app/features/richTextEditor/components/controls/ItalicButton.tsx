import { Editor } from '@tiptap/react'
import { useCallback } from 'react'

import { useEditorMarkActive } from '../../hooks/useEditorMarkActive'
import { ToolbarButton } from './ToolbarButton'

type Props = {
	editor: Editor
}

export function ItalicButton({ editor }: Props) {
	const active = useEditorMarkActive(editor, 'italic')

	const onClick = useCallback(() => {
		editor?.chain().focus().toggleItalic().run()
	}, [editor])

	return (
		<ToolbarButton tooltip="Italic" onClick={onClick} active={active}>
			<i>I</i>
		</ToolbarButton>
	)
}
