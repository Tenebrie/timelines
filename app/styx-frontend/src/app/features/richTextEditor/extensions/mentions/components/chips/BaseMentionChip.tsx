import Chip from '@mui/material/Chip'

import { colorStringToHsl } from '@/app/utils/colors/colorStringToHsl'
import { getContrastTextColor } from '@/app/utils/colors/getContrastTextColor'

type Props = {
	label: string
	color: string | undefined
	onClick: () => void
}

export const BaseMentionChip = ({ label, color, onClick }: Props) => {
	const textColor = getContrastTextColor(color ?? '#eee')
	const parsedColor = colorStringToHsl(color ?? '#000')

	return (
		<Chip
			size="small"
			sx={{
				height: '1.6em',
				'& .MuiChip-label': { fontSize: '1em' },
				color: textColor,
			}}
			onClick={() => onClick()}
			style={{
				background: `linear-gradient(90deg,
					hsl(${parsedColor.h * 360 - 15}deg, ${parsedColor.s * 100}%, ${parsedColor.l * 100}%) 0%,
					hsl(${parsedColor.h * 360 + 0}deg, ${parsedColor.s * 100}%, ${parsedColor.l * 100}%) 50%,
					hsl(${parsedColor.h * 360 + 15}deg, ${parsedColor.s * 100}%, ${parsedColor.l * 100}%) 100%)`,
			}}
			label={label}
		/>
	)
}
