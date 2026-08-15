import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import { Editor } from '@tiptap/react'
import { useCallback } from 'react'

import { useEditorMarkActive } from '../../hooks/useEditorMarkActive'
import { ToolbarButton } from './ToolbarButton'

type Props = {
	editor: Editor
}

export function BulletListButton({ editor }: Props) {
	const active = useEditorMarkActive(editor, 'bulletList')

	const onClick = useCallback(() => {
		editor?.chain().focus().toggleBulletList().run()
	}, [editor])

	return (
		<ToolbarButton tooltip="Bullet list" onClick={onClick} active={active}>
			<FormatListBulletedIcon fontSize="small" />
		</ToolbarButton>
	)
}
