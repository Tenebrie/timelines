import Check from '@mui/icons-material/Check'
import Error from '@mui/icons-material/Error'
import MoreHoriz from '@mui/icons-material/MoreHoriz'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
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
		transition: opacity 0.2s !important;
		transition-delay: 0s !important;

		&.visible {
			opacity: 1;
			transition-delay: 0.2s !important;
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
			<Box
				className={`${savingState === 'waiting' ? 'visible' : ''}`}
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					height: '100%',
					width: '100%',
				}}
			>
				<CircularProgress size={16} color="inherit" />
			</Box>
			<Check className={`${savingState === 'success' ? 'visible' : ''}`} />
			<Error className={`${savingState === 'error' ? 'visible' : ''}`} />
		</IconContainer>
	)
}
