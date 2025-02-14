import { Editor, useEditor } from '@tiptap/react'
import throttle from 'lodash.throttle'
import { memo, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useCustomTheme } from '@/app/hooks/useCustomTheme'

import { getWikiPreferences } from '../preferences/selectors'
import { getWorldState } from '../world/selectors'
import { MentionDetails } from '../worldTimeline/types'
import { EditorExtensions } from './extensions/config'
import { FadeInOverlay } from './extensions/mentions/components/FadeInOverlay/FadeInOverlay'
import { MentionNodeName } from './extensions/mentions/components/MentionNode'
import { MentionsList } from './extensions/mentions/MentionsList'
import { RichTextEditorControls } from './RichTextEditorControls'
import { StyledContainer, StyledEditorContent } from './styles'

type Props = {
	value: string
	softKey: string | number
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

export const RichTextEditorComponent = ({ value, softKey, onChange, onBlur, allowReadMode }: Props) => {
	const theme = useCustomTheme()
	const { isReadOnly } = useSelector(getWorldState, (a, b) => a.isReadOnly === b.isReadOnly)
	const { readModeEnabled } = useSelector(getWikiPreferences)

	const onChangeRef = useRef(onChange)
	useEffect(() => {
		onChangeRef.current = onChange
	}, [onChange])

	const onChangeThrottled = useRef(
		throttle((editor: Editor) => {
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

			onChangeRef.current({
				plainText: editor.getText(),
				richText: editor.getHTML(),
				mentions,
			})
		}, 100),
	)

	const isReadMode = (isReadOnly || (readModeEnabled && allowReadMode)) ?? false

	const editor = useEditor({
		content: value,
		editable: !isReadMode,
		extensions: EditorExtensions,
		onUpdate({ editor }) {
			if (editor.getHTML() === value) {
				return
			}
			onChangeThrottled.current(editor)
		},
	})

	const currentValue = useRef(value)

	useEffect(() => {
		currentValue.current = value
	}, [value])

	useEffect(() => {
		if (!editor) {
			return
		}

		// 1. Capture the old content and selection before updating.
		const oldText = editor.getText() // or editor.getHTML() depending on your use case
		const { from, to } = editor.state.selection

		// Extract up to 5 characters before and after the selection.
		const leftContext = oldText.substring(Math.max(0, from - 5), from)
		const rightContext = oldText.substring(to, to + 5)

		// 2. Update the content with the new value.
		const newText = currentValue.current
		editor.commands.setContent(newText)

		// 3. Try to find the matching positions in the new text.

		// Find where the left context appears.
		let newFrom = -1
		if (leftContext.length > 0) {
			const leftIndex = newText.indexOf(leftContext)
			if (leftIndex !== -1) {
				newFrom = leftIndex - leftContext.length + 2
			}
		}
		// If not found, fallback to the old 'from'
		if (newFrom === -1) {
			newFrom = from
		}

		// Find the right context after newFrom.
		let newTo = -1
		if (rightContext.length > 0) {
			const rightIndex = newText.indexOf(rightContext, newFrom)
			if (rightIndex !== -1) {
				newTo = rightIndex
			}
		}
		// Fallback: try to preserve the original selection length.
		if (newTo === -1) {
			newTo = newFrom + (to - from)
		}

		// If the selection was just a caret, ensure both positions match.
		if (from === to) {
			newTo = newFrom
		}

		editor.commands.setTextSelection({ from: newFrom, to: newTo })
	}, [editor, softKey])

	useEffect(() => {
		editor?.setEditable(!isReadMode)
	}, [editor, isReadMode])

	return (
		<StyledContainer
			sx={{
				borderRadius: '6px',
				minHeight: '128px',
				border: isReadMode ? '1px solid transparent' : '',
				'&:hover': {
					border: isReadMode ? '1px solid transparent' : '',
				},
				position: 'relative',
			}}
			data-testid="RichTextEditor"
			$theme={theme}
			onBlur={() => {
				onBlur?.()
				onChangeThrottled.current.cancel()
			}}
		>
			<RichTextEditorControls editor={editor} allowReadMode={allowReadMode} />
			<StyledEditorContent className="content" editor={editor} $mode={isReadMode ? 'read' : 'edit'} />
			<MentionsList editor={editor} />
			<FadeInOverlay key={softKey} content={value} isReadMode={isReadMode} />
		</StyledContainer>
	)
}

export const RichTextEditor = memo(RichTextEditorComponent)
