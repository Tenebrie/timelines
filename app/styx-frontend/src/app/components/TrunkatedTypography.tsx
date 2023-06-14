import Typography from '@mui/material/Typography'
import styled from 'styled-components'

export const TrunkatedSpan = styled.span<{ lines: number; component?: string }>`
	display: -webkit-box;
	-webkit-line-clamp: ${(props) => props.lines};
	-webkit-box-orient: vertical;
	overflow: hidden;
`

export const TrunkatedTypography = styled(Typography)<{ lines: number; component?: string }>`
	display: -webkit-box;
	-webkit-line-clamp: ${(props) => props.lines};
	-webkit-box-orient: vertical;
	overflow: hidden;
`
