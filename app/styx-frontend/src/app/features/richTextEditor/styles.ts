import { Box } from '@mui/material'
import { EditorContent } from '@tiptap/react'
import styled from 'styled-components'

import { CustomTheme } from '@/hooks/useCustomTheme'

export const StyledContainer = styled(Box)<{ $theme: CustomTheme }>`
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
		position: absolute;
		color: ${({ $theme }) => $theme.material.palette.text.secondary};
		content: attr(data-placeholder);
		height: 0;
		pointer-events: none;
		font-weight: 400;
	}

	.ProseMirror-selectednode {
		.MuiChip-root {
			outline: 2px solid #4caf50;
		}
	}
`

export const StyledEditorContent = styled(EditorContent)`
	font-family: 'Roboto', sans-serif;
	outline: none;
	height: 200px;
	overflow-y: auto;

	&::focus {
		background: red;
	}

	.ProseMirror {
		outline: none;
		height: 100%;
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
