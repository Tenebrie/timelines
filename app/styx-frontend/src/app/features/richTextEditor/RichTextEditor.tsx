import { MentionDetails } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import { Editor, useEditor } from '@tiptap/react'
import { EditorContent } from '@tiptap/react'
import throttle from 'lodash.throttle'
import { memo, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'

import { getWorldState } from '../../views/world/WorldSliceSelectors'
import { useEventBusSubscribe } from '../eventBus'
import { getWikiPreferences } from '../preferences/PreferencesSliceSelectors'
import { EditorExtensions } from './extensions/config'
import { FadeInOverlay } from './extensions/mentions/components/FadeInOverlay/FadeInOverlay'
import { MentionNodeName } from './extensions/mentions/components/MentionNode'
import { MentionsList } from './extensions/mentions/MentionsList'
import { RichTextEditorControls } from './RichTextEditorControls'
import { StyledContainer } from './styles'

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

type EditorContentBoxProps = {
	editor: Editor
	mode: 'read' | 'edit'
	className?: string
	readOnly?: boolean
}

export const EditorContentBox = ({ editor, mode, className, readOnly }: EditorContentBoxProps) => (
	<Box
		component={EditorContent}
		className={className}
		editor={editor}
		readOnly={readOnly}
		sx={{
			fontFamily: '"Roboto", sans-serif',
			outline: 'none',
			height: mode === 'edit' ? 'calc(100% - 48px)' : 'unset',
			overflowY: 'auto',
			display: 'flex',
			flexDirection: 'column',

			'& img': {
				maxHeight: '400px',
				maxWidth: '100%',
			},

			'& .ProseMirror': {
				flex: 1,
				outline: 'none',
				minHeight: '1rem',
				height: '100%',
				padding: mode === 'edit' ? '0 16px' : 'unset',
				color: 'text.primary',

				'& > p:first-of-type': {
					paddingTop: '16px',
				},
			},

			'& p': {
				margin: 0,
				padding: '6px 0px',
				lineHeight: 1.5,
				wordBreak: 'break-word',
				color: 'text.primary',
			},

			'& li > p': {
				padding: '3px 0',
			},

			'& code': {
				padding: '4px 8px',
				borderRadius: '4px',
				background: '#00000033',
			},
			...useBrowserSpecificScrollbars(),
		}}
	/>
)

export const RichTextEditorComponent = ({ value, softKey, onChange, onBlur, allowReadMode }: Props) => {
	const theme = useCustomTheme()
	const { isReadOnly } = useSelector(getWorldState, (a, b) => a.isReadOnly === b.isReadOnly)
	const { readModeEnabled } = useSelector(
		getWikiPreferences,
		(a, b) => a.readModeEnabled === b.readModeEnabled,
	)

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
		onUpdate({ editor, transaction }) {
			if (editor.getHTML() === value || transaction.steps.length === 0) {
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

	useEventBusSubscribe({
		event: 'richEditor/requestFocus',
		callback: () => {
			editor?.commands.focus()
			editor?.commands.selectTextblockEnd()
		},
	})
	useEventBusSubscribe({
		event: 'richEditor/requestBlur',
		callback: () => {
			editor?.commands.blur()
		},
	})

	return (
		<StyledContainer
			sx={{
				borderRadius: '6px',
				minHeight: '128px',
				background: isReadMode ? '' : '#00000011',
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
			{editor && <EditorContentBox className="content" editor={editor} mode={isReadMode ? 'read' : 'edit'} />}
			<MentionsList editor={editor} />
			<FadeInOverlay key={softKey} content={value} isReadMode={isReadMode} />
		</StyledContainer>
	)
}

export const RichTextEditor = memo(RichTextEditorComponent)
