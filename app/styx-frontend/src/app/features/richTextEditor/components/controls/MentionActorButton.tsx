import { Editor } from '@tiptap/react'
import { useCallback } from 'react'

import { dispatchGlobalEvent } from '@/app/features/eventBus'
import { Button } from '@/ui-lib/components/Button/Button'

type Props = {
	editor: Editor
}

export function MentionActorButton({ editor }: Props) {
	const onClick = useCallback(() => {
		if (!editor) {
			return
		}

		const pos = editor.state.selection.$head.pos
		if (editor.state.doc.textBetween(pos - 1, pos) !== ' ') {
			editor.chain().focus().insertContent(' ').run()
		}
		editor.chain().focus().insertContent('@').run()
		const visualPos = editor.view.coordsAtPos(editor.state.selection.from)
		dispatchGlobalEvent['quickSelect/requestOpen']({
			query: '',
			screenPosTop: visualPos.top,
			screenPosBottom: visualPos.bottom,
			screenPosLeft: visualPos.left,
		})
	}, [editor])

	return (
		<Button onClick={onClick} color="secondary">
			@Mention
		</Button>
	)
}
