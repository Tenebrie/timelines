import { Check, Error, MoreHoriz, Save } from '@mui/icons-material'
import styled from 'styled-components'

import { SavingState } from './types'

type Subprops = {
	savingState: SavingState
	isSaving: boolean
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
	}
`

export const AutosaveIcon = ({ savingState, isSaving }: Subprops) => {
	return (
		<IconContainer>
			<Save className={`${savingState === 'none' ? 'visible' : ''}`} />
			<MoreHoriz className={`${savingState === 'debounce' ? 'visible' : ''}`} />
			<Check className={`${savingState === 'success' || isSaving ? 'visible' : ''}`} />
			<Error className={`${savingState === 'error' ? 'visible' : ''}`} />
		</IconContainer>
	)
}
