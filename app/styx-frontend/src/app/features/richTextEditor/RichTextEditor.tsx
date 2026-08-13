import Box from '@mui/material/Box'
import { useEditor } from '@tiptap/react'
import throttle from 'lodash.throttle'
import { memo, useEffect, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

import { getWorldState } from '../../views/world/WorldSliceSelectors'
import { useEventBusSubscribe } from '../eventBus'
import { EditorContentBox } from './components/EditorContentBox'
import { FadeInOverlay } from './components/FadeInOverlay/FadeInOverlay'
import { useCollaboration } from './extensions/collaboration/useCollaboration'
import { EditorExtensions } from './extensions/editorExtensions'
import { useEditorPasteHandler } from './hooks/useEditorPasteHandler'
import { RichTextEditorControls } from './RichTextEditorControls'
import { RichTextEditorQuickSelect } from './RichTextEditorQuickSelect'
import { StyledContainer } from './styles'

type Props = {
	value: string
	softKey: string | number
	onChange: (params: OnChangeParams) => void
	onBlur?: () => void
	allowReadMode?: boolean
	fadeInOverlayColor: string
	// Collaboration params (optional)
	collaboration?: {
		entityType: 'actor' | 'event' | 'article'
		documentId: string
	}
	autoFocus?: boolean
	isLoading?: boolean
}

export type RichTextEditorProps = Props

export type OnChangeParams = {
	plainText: string
	richText: string
}

export const RichTextEditor = memo(RichTextEditorComponent)

export function RichTextEditorComponent({
	value,
	softKey,
	onChange,
	onBlur,
	fadeInOverlayColor,
	collaboration,
	autoFocus,
	isLoading,
}: Props) {
	const theme = useCustomTheme()
	const { isReadOnly } = useSelector(getWorldState, (a, b) => a.isReadOnly === b.isReadOnly)

	// Enable collaboration if params provided
	const { extension: collaborationExtension, isReady: collabReady } = useCollaboration({
		enabled: !!collaboration,
		documentId: collaboration?.documentId ?? '',
		entityType: collaboration?.entityType ?? 'actor',
	})

	const onChangeRef = useRef(onChange)
	useEffect(() => {
		onChangeRef.current = onChange
	}, [onChange])

	const onChangeThrottled = useRef(
		throttle(({ plainText, richText }: { plainText: string; richText: string }) => {
			onChangeRef.current({
				plainText,
				richText,
			})
		}, 100),
	)

	useEffect(() => {
		onChangeThrottled.current.cancel()
	}, [collaboration?.documentId])

	// Add collaboration extension if enabled
	const extensions = useMemo(() => {
		return collaborationExtension ? [...EditorExtensions, collaborationExtension] : EditorExtensions
	}, [collaborationExtension])

	const { handlePaste } = useEditorPasteHandler()

	const editor = useEditor(
		{
			// content: value,
			// editable: !isReadOnly && (!collaboration || collabReady),
			extensions,
			autofocus: false,
			editorProps: {
				handlePaste,
			},
			onUpdate({ editor, transaction }) {
				const richText = editor.getHTML()
				if (richText === value || transaction.steps.length === 0) {
					return
				}
				onChangeThrottled.current({
					plainText: editor.getText(),
					richText,
				})
			},
			onCreate({ editor }) {
				if (!autoFocus) {
					return
				}

				requestIdleCallback(
					() => {
						if (!editor.isDestroyed) {
							editor.commands.focus('end', { scrollIntoView: false })
						}
					},
					{ timeout: 100 },
				)
			},
		},
		[extensions],
	)

	const currentValue = useRef(value)

	useEffect(() => {
		currentValue.current = value
	}, [value])

	useEffect(() => {
		const editable = !isReadOnly && (!collaboration || collabReady)
		editor?.setEditable(editable)
	}, [collabReady, collaboration, editor, isReadOnly])

	useEventBusSubscribe['richEditor/requestFocus']({
		callback: () => {
			editor?.commands.focus()
			editor?.commands.selectTextblockEnd()
		},
	})
	useEventBusSubscribe['richEditor/requestBlur']({
		callback: () => {
			editor?.commands.blur()
		},
	})

	return (
		<StyledContainer
			sx={{
				borderRadius: '6px',
				minHeight: '128px',
				background: isReadOnly ? '' : theme.custom.palette.background.textEditor,
				display: 'flex',
				flexDirection: 'column',
			}}
			data-testid="RichTextEditor"
			$theme={theme}
			onBlur={() => {
				onBlur?.()
				onChangeThrottled.current.cancel()
			}}
		>
			<RichTextEditorControls editor={editor} />
			<Box sx={{ position: 'relative', flex: 1, minHeight: 0 }}>
				{editor && (
					<EditorContentBox
						className="content"
						editor={editor}
						mode={isReadOnly ? 'read' : 'edit'}
					></EditorContentBox>
				)}
				<FadeInOverlay
					key={softKey}
					content={value}
					isReadMode={isReadOnly}
					color={fadeInOverlayColor}
					isLoading={isLoading || !collabReady || false}
				/>
			</Box>
			<RichTextEditorQuickSelect editor={editor} />
		</StyledContainer>
	)
}
