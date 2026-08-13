import { Editor } from '@tiptap/react'
import { useCallback } from 'react'

import { useEditorMarkActive } from '../../hooks/useEditorMarkActive'
import { ToolbarButton } from './ToolbarButton'

type Props = {
	editor: Editor
}

export function UnderlineButton({ editor }: Props) {
	const active = useEditorMarkActive(editor, 'underline')

	const onClick = useCallback(() => {
		editor?.chain().focus().toggleUnderline().run()
	}, [editor])

	return (
		<ToolbarButton tooltip="Underline" onClick={onClick} active={active}>
			<u>U</u>
		</ToolbarButton>
	)
}
