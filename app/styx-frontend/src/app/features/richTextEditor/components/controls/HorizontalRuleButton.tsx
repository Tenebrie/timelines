import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'
import { Editor } from '@tiptap/react'
import { useCallback } from 'react'

import { ToolbarButton } from './ToolbarButton'

type Props = {
	editor: Editor
}

export function HorizontalRuleButton({ editor }: Props) {
	const onClick = useCallback(() => {
		editor?.chain().focus().setHorizontalRule().run()
	}, [editor])

	return (
		<ToolbarButton tooltip="Horizontal rule" onClick={onClick}>
			<HorizontalRuleIcon fontSize="small" />
		</ToolbarButton>
	)
}
