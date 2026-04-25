import Box from '@mui/material/Box'
import styled from 'styled-components'

import { CustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

export const StyledContainer = styled(Box)<{ $theme: CustomTheme }>`
	flex: 0;
	height: 100%;

	.tiptap p.is-editor-empty:first-child::before {
		position: absolute;
		color: ${({ $theme }) => $theme.material.palette.text.secondary};
		content: attr(data-placeholder);
		height: 0;
		pointer-events: none;
		font-weight: 400;
	}

	.ProseMirror-selectednode .MuiChip-root {
		outline: 2px solid ${({ $theme }) => $theme.material.palette.primary.main};
	}

	/* Shift-arrow / range selection covering the chip */
	.ProseMirror-focused span[data-type='mention'].mention-in-range .MuiChip-root {
		outline: 2px solid ${({ $theme }) => $theme.material.palette.primary.main};
	}
`
