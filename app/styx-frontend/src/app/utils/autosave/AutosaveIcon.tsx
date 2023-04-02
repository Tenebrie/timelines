import { Check, MoreHoriz, Save } from '@mui/icons-material'
import styled from 'styled-components'

import { SavingState } from './types'

type Subprops = {
	savingState: SavingState
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
		transition: opacity 0.2s !important;

		&.visible {
			opacity: 1;
		}
	}
`

export const AutosaveIcon = ({ savingState }: Subprops) => {
	return (
		<IconContainer>
			<Save className={`${savingState === 'none' ? 'visible' : ''}`} />
			<MoreHoriz className={`${savingState === 'debounce' ? 'visible' : ''}`} />
			<Check className={`${savingState === 'success' ? 'visible' : ''}`} />
		</IconContainer>
	)
}
