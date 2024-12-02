import { Box, Button, Paper } from '@mui/material'
import Placeholder from '@tiptap/extension-placeholder'
import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import debounce from 'lodash.debounce'
import { useRef } from 'react'
import styled from 'styled-components'

import { CustomTheme, useCustomTheme } from '@/hooks/useCustomTheme'

type Props = {
	value: string
	onChangeRich: (value: string) => void
	onChangePlain: (value: string) => void
}

export const RichTextEditor = ({ value, onChangeRich, onChangePlain }: Props) => {
	const theme = useCustomTheme()

	const onChangeThrottled = useRef(
		debounce((editor: Editor) => {
			onChangeRich(editor.getHTML())
			onChangePlain(editor.getText())
			editor.getJSON()
		}, 100),
	)

	const editor = useEditor({
		content: value,
		autofocus: 'end',
		extensions: [
			StarterKit.configure({
				hardBreak: false,
			}),
			Placeholder.configure({
				placeholder: 'Content',
			}),
		],
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
			<Paper>
				<Button>Bold</Button>
				<Button>Italic</Button>
			</Paper>
			<StyledEditorContent className="content" editor={editor} placeholder="Content" />
			{/* <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu> */}
			{/* <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
		</StyledContainer>
	)
}

const StyledContainer = styled(Box)<{ $theme: CustomTheme }>`
	flex: 0;
	border: 1px solid ${({ $theme }) => $theme.custom.palette.outline};

	&:hover {
		border: 1px solid ${({ $theme }) => $theme.material.palette.text.primary};
	}

	&:has(.content .ProseMirror-focused) {
		border: 1px solid ${({ $theme }) => $theme.material.palette.primary.main};
		outline: 1px solid ${({ $theme }) => $theme.material.palette.primary.main};
	}

	.tiptap p.is-editor-empty:first-child::before {
		color: ${({ $theme }) => $theme.material.palette.text.secondary};
		content: attr(data-placeholder);
		height: 0;
		pointer-events: none;
		font-weight: 400;
	}
`

const StyledEditorContent = styled(EditorContent)`
	font-family: 'Roboto', sans-serif;
	outline: none;

	&::focus {
		background: red;
	}

	.ProseMirror {
		outline: none;
	}

	p {
		margin: 0;
		padding: 6px 16px;
		line-height: 1.5;
		word-break: break-word;
	}
	p:first-child {
		padding-top: 16px;
	}
	p:last-child {
		padding-bottom: 16px;
	}

	.ProseMirror {
		min-height: 1rem;
	}
`
