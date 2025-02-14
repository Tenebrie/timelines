import Box from '@mui/material/Box'
import { EditorContent } from '@tiptap/react'
import styled from 'styled-components'

import { CustomTheme } from '@/app/hooks/useCustomTheme'

export const StyledContainer = styled(Box)<{ $theme: CustomTheme }>`
	flex: 0;
	border: 1px solid ${({ $theme }) => $theme.custom.palette.outline};
	height: 100%;

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

export const StyledEditorContent = styled(EditorContent)<{ $mode: 'read' | 'edit' }>`
	font-family: 'Roboto', sans-serif;
	outline: none;
	height: ${(props) => (props.$mode === 'edit' ? 'calc(100% - 48px)' : 'unset')};
	overflow-y: auto;
	display: flex;
	flex-direction: column;

	&::focus {
		background: red;
	}

	img {
		max-height: 400px;
		max-width: 100%;
	}

	.ProseMirror {
		flex: 1;
		outline: none;
		min-height: 1rem;
		height: 100%;
		padding: ${(props) => (props.$mode === 'edit' ? '0 16px' : 'unset')};

		& > p:first-child {
			padding-top: 16px;
		}
	}

	p {
		margin: 0;
		padding: 6px 0px;
		line-height: 1.5;
		word-break: break-word;
	}
	li > p {
		padding: 3px 0;
	}
	// p:last-child {
	// 	padding-bottom: 0px;
	// }

	code {
		padding: 4px 8px;
		border-radius: 4px;
		background: #00000033;
	}
`
