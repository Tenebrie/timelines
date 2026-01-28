import { MentionDetails } from '@api/types/worldTypes'
import { Editor, useEditor } from '@tiptap/react'
import throttle from 'lodash.throttle'
import { memo, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

import { getWorldState } from '../../views/world/WorldSliceSelectors'
import { useEventBusSubscribe } from '../eventBus'
import { getWikiPreferences } from '../preferences/PreferencesSliceSelectors'
import { EditorContentBox } from './components/EditorContentBox'
import { useCollaboration } from './extensions/collaboration/useCollaboration'
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
	mentions: MentionDetails[]
}

export const RichTextEditorComponent = ({
	value,
	softKey,
	onChange,
	onBlur,
	allowReadMode,
	fadeInOverlayColor,
	collaboration,
	autoFocus,
	isLoading,
}: Props) => {
	const theme = useCustomTheme()
	const { isReadOnly } = useSelector(getWorldState, (a, b) => a.isReadOnly === b.isReadOnly)
	const { readModeEnabled } = useSelector(
		getWikiPreferences,
		(a, b) => a.readModeEnabled === b.readModeEnabled,
	)

	// Enable collaboration if params provided
	const {
		extension: collaborationExtension,
		isReady: collabReady,
		needsInitialContent,
	} = useCollaboration({
		enabled: !!collaboration,
		documentId: collaboration?.documentId ?? '',
		entityType: collaboration?.entityType ?? 'actor',
		initialContent: value,
	})

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

	// Add collaboration extension if enabled
	const extensions = collaborationExtension ? [...EditorExtensions, collaborationExtension] : EditorExtensions

	const editor = useEditor(
		{
			content: value,
			editable: !isReadMode,
			extensions,
			autofocus: autoFocus ? 'end' : false,
			onUpdate({ editor, transaction }) {
				if (editor.getHTML() === value || transaction.steps.length === 0) {
					return
				}
				onChangeThrottled.current(editor)
			},
		},
		[collabReady],
	)

	const currentValue = useRef(value)

	useEffect(() => {
		currentValue.current = value
	}, [value])

	// Populate Yjs doc with initial content if it was empty after sync
	useEffect(() => {
		if (needsInitialContent && editor && value) {
			editor.commands.setContent(value)
		}
	}, [needsInitialContent, editor, value])

	useEffect(() => {
		editor?.setEditable(!isReadMode)
	}, [editor, isReadMode])

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
				background: isReadMode ? '' : theme.custom.palette.background.textEditor,
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
			<FadeInOverlay
				key={softKey}
				content={value}
				isReadMode={isReadMode}
				color={fadeInOverlayColor}
				isLoading={isLoading || !collabReady || false}
			/>
		</StyledContainer>
	)
}

export const RichTextEditor = memo(RichTextEditorComponent)
