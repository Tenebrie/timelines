import { Editor, useEditor } from '@tiptap/react'
import debounce from 'lodash.debounce'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useCustomTheme } from '@/hooks/useCustomTheme'

import { getWikiPreferences } from '../preferences/selectors'
import { MentionsList } from './extensions/actorMentions/MentionsList'
import { EditorExtensions } from './extensions/config'
import { RichTextEditorControls } from './RichTextEditorControls'
import { StyledContainer, StyledEditorContent } from './styles'

type Props = {
	value: string
	onChange: (params: { plainText: string; richText: string; mentions: string[] }) => void
	onBlur?: () => void
	allowReadMode?: boolean
}
export type RichTextEditorProps = Props

export type OnChangeParams = {
	plainText: string
	richText: string
	mentions: string[]
}

export const RichTextEditor = ({ value, onChange, onBlur, allowReadMode }: Props) => {
	const theme = useCustomTheme()
	const { readModeEnabled } = useSelector(getWikiPreferences)

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

	const isReadMode = readModeEnabled && allowReadMode

	const editor = useEditor({
		content: value,
		autofocus: 'end',
		editable: !isReadMode,
		extensions: EditorExtensions,
		onUpdate({ editor }) {
			onChangeThrottled.current(editor)
		},
	})

	useEffect(() => {
		editor?.setEditable(!isReadMode)
	}, [editor, isReadMode])

	return (
		<StyledContainer
			sx={{
				borderRadius: '6px',
				height: '100%',
				border: isReadMode ? '1px solid transparent' : '',
				'&:hover': {
					border: isReadMode ? '1px solid transparent' : '',
				},
			}}
			$theme={theme}
			onBlur={onBlur}
		>
			<RichTextEditorControls editor={editor} allowReadMode />
			<StyledEditorContent
				className="content"
				editor={editor}
				placeholder="Content"
				readOnly
				$mode={isReadMode ? 'read' : 'edit'}
			/>
			<MentionsList editor={editor} />
		</StyledContainer>
	)
}
