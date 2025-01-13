import Check from '@mui/icons-material/Check'
import Error from '@mui/icons-material/Error'
import MoreHoriz from '@mui/icons-material/MoreHoriz'
import { ReactElement } from 'react'
import styled from 'styled-components'

import { SavingState } from './types'

type Subprops = {
	savingState: SavingState
	isSaving: boolean
	defaultIcon: ReactElement
}

const IconContainer = styled.span`
	position: relative;
	width: 1em;
	height: 1em;

	& > * {
		top: 0;
		left: 0;
		position: absolute;
		font-size: 1em !important;
		opacity: 0;
		transition: opacity 0.3s !important;
		transition-delay: 0s !important;

		&.visible {
			opacity: 1;
			transition-delay: 0.3s !important;
		}

		&.default {
			width: 100%;
			height: 100%;
		}
	}
`

export const AutosaveIcon = ({ savingState, isSaving, defaultIcon }: Subprops) => {
	return (
		<IconContainer>
			<svg className={`${savingState === 'none' ? 'default visible' : 'default'}`}>{defaultIcon}</svg>
			<MoreHoriz className={`${savingState === 'debounce' ? 'visible' : ''}`} />
			<Check className={`${savingState === 'success' || isSaving ? 'visible' : ''}`} />
			<Error className={`${savingState === 'error' ? 'visible' : ''}`} />
		</IconContainer>
	)
}
