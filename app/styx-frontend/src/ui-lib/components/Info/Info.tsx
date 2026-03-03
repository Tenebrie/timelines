import InfoOutlinedIcon from '@mui/icons-material/Info'
import { SxProps } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'

type Props = {
	value: string
	sx?: SxProps
}

export function Info({ value, sx }: Props) {
	return (
		<Tooltip title={value} disableInteractive enterDelay={300}>
			<InfoOutlinedIcon sx={{ fontSize: '1em', opacity: 0.5, cursor: 'help', ...sx }} />
		</Tooltip>
	)
}
