import Chip from '@mui/material/Chip'

import { getContrastTextColor } from '@/app/utils/getContrastTextColor'

type Props = {
	text: string
	color: string
	onClick?: () => void
}

export const ColoredChip = ({ text, color, onClick }: Props) => {
	const textColor = getContrastTextColor(color ?? '#eee')

	return (
		<Chip
			size="small"
			sx={{
				height: '1.6em',
				'& .MuiChip-label': { fontSize: '1em' },
				color: textColor,
			}}
			style={{ backgroundColor: color }}
			onClick={() => onClick?.()}
			label={text}
		/>
	)
}
