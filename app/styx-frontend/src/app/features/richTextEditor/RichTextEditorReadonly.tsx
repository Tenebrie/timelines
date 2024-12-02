import { Box } from '@mui/material'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import styled from 'styled-components'

import { CustomTheme, useCustomTheme } from '@/hooks/useCustomTheme'

type Props = {
	value: string
}

export const RichTextEditorReadonly = ({ value }: Props) => {
	const theme = useCustomTheme()

	const editor = useEditor({
		content: value,
		editable: false,
		extensions: [
			StarterKit.configure({
				hardBreak: false,
			}),
			Placeholder.configure({
				placeholder: 'Content',
			}),
		],
	})

	return (
		<StyledContainer
			sx={{
				borderRadius: '6px',
			}}
			$theme={theme}
		>
			<StyledEditorContent className="content" editor={editor} readOnly />
		</StyledContainer>
	)
}

const StyledContainer = styled(Box)<{ $theme: CustomTheme }>`
	flex: 0;
	border: 1px solid ${({ $theme }) => $theme.custom.palette.outline};

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
