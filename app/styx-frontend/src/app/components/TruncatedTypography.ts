import Typography from '@mui/material/Typography'
import styled from 'styled-components'

export const TruncatedSpan = styled.span<{ $lines: number; component?: string }>`
	display: -webkit-box;
	-webkit-line-clamp: ${(props) => props.$lines};
	-webkit-box-orient: vertical;
	overflow: hidden;
`

export const TruncatedTypography = styled(Typography)<{ $lines: number; component?: string }>`
	display: -webkit-box;
	-webkit-line-clamp: ${(props) => props.$lines};
	-webkit-box-orient: vertical;
	overflow: hidden;
`
