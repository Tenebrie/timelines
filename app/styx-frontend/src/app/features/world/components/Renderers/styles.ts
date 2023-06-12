import { ChevronLeft } from '@mui/icons-material'
import styled from 'styled-components'

export const ShowHideChevron = styled(ChevronLeft)`
	transform: rotate(90deg);

	&.collapsed {
		transform: rotate(270deg);
	}
`
