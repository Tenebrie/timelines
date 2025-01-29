import { Editor, useEditor } from '@tiptap/react'
import debounce from 'lodash.debounce'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useCustomTheme } from '@/hooks/useCustomTheme'

import { getWikiPreferences } from '../preferences/selectors'
import { getWorldState } from '../world/selectors'
import { MentionDetails } from '../worldTimeline/types'
import { EditorExtensions } from './extensions/config'
import { MentionNodeName } from './extensions/mentions/components/MentionNode'
import { MentionsList } from './extensions/mentions/MentionsList'
import { RichTextEditorControls } from './RichTextEditorControls'
import { StyledContainer, StyledEditorContent } from './styles'

type Props = {
	value: string
	onChange: (params: OnChangeParams) => void
	onBlur?: () => void
	allowReadMode?: boolean
}
export type RichTextEditorProps = Props

export type OnChangeParams = {
	plainText: string
	richText: string
	mentions: MentionDetails[]
}

export const RichTextEditor = ({ value, onChange, onBlur, allowReadMode }: Props) => {
	const theme = useCustomTheme()
	const { isReadOnly } = useSelector(getWorldState, (a, b) => a.isReadOnly === b.isReadOnly)
	const { readModeEnabled } = useSelector(getWikiPreferences)

	const onChangeThrottled = useRef(
		debounce((editor: Editor) => {
			const mentions: MentionDetails[] = []
			editor.state.doc.descendants((node) => {
				if (node.type.name === MentionNodeName) {
					const actorId = node.attrs.componentProps.actor as string | undefined
					const eventId = node.attrs.componentProps.event as string | undefined
					const articleId = node.attrs.componentProps.article as string | undefined
					if (actorId) {
						mentions.push({
							targetId: node.attrs.componentProps.actor as string,
							targetType: 'Actor',
						})
					} else if (eventId) {
						mentions.push({
							targetId: node.attrs.componentProps.event as string,
							targetType: 'Event',
						})
					} else if (articleId) {
						mentions.push({
							targetId: node.attrs.componentProps.article as string,
							targetType: 'Article',
						})
					}
				}
			})

			onChange({
				plainText: editor.getText(),
				richText: editor.getHTML(),
				mentions,
			})
		}, 100),
	)

	const isReadMode = isReadOnly || (readModeEnabled && allowReadMode)

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
			<RichTextEditorControls editor={editor} allowReadMode={allowReadMode && !isReadOnly} />
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
