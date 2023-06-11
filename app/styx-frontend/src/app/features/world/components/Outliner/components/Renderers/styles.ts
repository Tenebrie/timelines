import { ChevronLeft } from '@mui/icons-material'
import styled from 'styled-components'

export const ShowHideChevron = styled(ChevronLeft)<{ rotated: 0 | 1 }>`
	transform: rotate(${(props) => (props.rotated === 0 ? 270 : 90)}deg);
`
