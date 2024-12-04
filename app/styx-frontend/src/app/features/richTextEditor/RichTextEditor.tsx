import { Editor, useEditor } from '@tiptap/react'
import debounce from 'lodash.debounce'
import { useRef } from 'react'

import { useCustomTheme } from '@/hooks/useCustomTheme'

import { MentionsList } from './extensions/actorMentions/MentionsList'
import { EditorExtensions } from './extensions/config'
import { RichTextEditorControls } from './RichTextEditorControls'
import { StyledContainer, StyledEditorContent } from './styles'

type Props = {
	value: string
	onChange: (params: { plainText: string; richText: string; mentions: string[] }) => void
}

export const RichTextEditor = ({ value, onChange }: Props) => {
	const theme = useCustomTheme()

	const onChangeThrottled = useRef(
		debounce((editor: Editor) => {
			const mentions: string[] = []
			editor.state.doc.descendants((node) => {
				if (node.type.name === 'mentionChip') {
					mentions.push(node.attrs.componentProps.actor)
				}
			})

			onChange({
				plainText: editor.getText(),
				richText: editor.getHTML(),
				mentions,
			})
		}, 100),
	)

	const editor = useEditor({
		content: value,
		autofocus: 'end',
		extensions: EditorExtensions,
		onUpdate({ editor }) {
			onChangeThrottled.current(editor)
		},
	})

	return (
		<StyledContainer
			sx={{
				borderRadius: '6px',
			}}
			$theme={theme}
		>
			<RichTextEditorControls editor={editor} />
			<StyledEditorContent className="content" editor={editor} placeholder="Content" />
			<MentionsList editor={editor} />
		</StyledContainer>
	)
}
