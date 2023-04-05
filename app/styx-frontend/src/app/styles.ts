import { css } from 'styled-components'

export const ScrollbarStyling = css`
	/* width */
	::-webkit-scrollbar {
		width: 8px;
	}

	/* Track */
	::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
	}

	/* Handle */
	::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.3);
	}

	/* Handle on hover */
	::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	::-webkit-scrollbar-thumb:active {
		background: rgba(255, 255, 255, 0.1);
	}
`
