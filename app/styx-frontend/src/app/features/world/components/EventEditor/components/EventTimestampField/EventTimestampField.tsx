import { FormControl, TextField, Typography } from '@mui/material'
import styled from 'styled-components'

import { useWorldTime } from '../../../../../time/hooks/useWorldTime'

type Props = {
	timestamp: number
	onChange: (value: number) => void
}

const StyledTextField = styled(TextField)`
	.MuiInputBase-root {
		padding-bottom: 31px;
	}
`

const OverlayingTimestamp = styled(Typography)`
	position: absolute;
	left: 14px;
	bottom: 14px;
`

export const EventTimestampField = ({ timestamp, onChange }: Props) => {
	const { timeToLabel } = useWorldTime()
	const readableTimestamp = timeToLabel(timestamp)
	return (
		<FormControl fullWidth>
			<StyledTextField
				label="Timestamp"
				value={timestamp}
				onChange={(e) => onChange(Number(e.target.value))}
				type={'number'}
			/>
			<OverlayingTimestamp variant="body1">{readableTimestamp}</OverlayingTimestamp>
		</FormControl>
	)
}
