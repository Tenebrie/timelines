import { PaletteMode } from '@mui/material/styles'
import styled from 'styled-components'

export const Container = styled.div<{ $theme: PaletteMode }>`
	position: absolute;
	top: 0;
	height: 100%;
	width: 24px;
	background: ${(props) => (props.$theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)')};
	transition: background 0.3s;

	&.left {
		left: 0;
		cursor: pointer;
	}

	&.right {
		right: 0;
		cursor: pointer;
	}

	&:hover {
		background: ${(props) => (props.$theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)')};
	}
	&:active {
		background: ${(props) => (props.$theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)')};
	}
`
