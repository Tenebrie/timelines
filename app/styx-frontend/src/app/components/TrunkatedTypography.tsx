import Typography from '@mui/material/Typography'
import styled from 'styled-components'

export const TrunkatedTypography = styled(Typography)<{ lines: number }>`
	display: -webkit-box;
	-webkit-line-clamp: ${(props) => props.lines};
	-webkit-box-orient: vertical;
	overflow: hidden;
`
