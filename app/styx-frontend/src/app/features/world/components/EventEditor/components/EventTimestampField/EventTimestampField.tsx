import { FormControl, TextField, Typography } from '@mui/material'
import styled from 'styled-components'

import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { WorldCalendarType } from '../../../../types'

type Props = {
	timestamp: number
	onChange: (value: number) => void
	label?: string
	calendar?: WorldCalendarType
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

export const EventTimestampField = ({ timestamp, onChange, label, calendar }: Props) => {
	const { timeToLabel } = useWorldTime({ calendar })
	const readableTimestamp = timeToLabel(timestamp)
	return (
		<FormControl fullWidth>
			<StyledTextField
				label={label ? label : 'Timestamp'}
				value={timestamp}
				onChange={(e) => onChange(Number(e.target.value))}
				type="number"
			/>
			<OverlayingTimestamp variant="body1">{readableTimestamp}</OverlayingTimestamp>
		</FormControl>
	)
}
