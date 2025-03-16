import Box from '@mui/material/Box'
import styled from 'styled-components'

import { CustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

export const StyledContainer = styled(Box)<{ $theme: CustomTheme }>`
	flex: 0;
	border: 1px solid ${({ $theme }) => $theme.custom.palette.outline};
	height: 100%;

	&:hover {
		border: 1px solid ${({ $theme }) => $theme.material.palette.text.primary};
	}

	body.cursor-grabbing &,
	body.cursor-resizing-ns &,
	body.cursor-resizing-ew & {
		&:hover {
			border: 1px solid ${({ $theme }) => $theme.custom.palette.outline};
		}
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
