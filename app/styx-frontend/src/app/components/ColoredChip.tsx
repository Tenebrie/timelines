import Chip from '@mui/material/Chip'

import { getContrastTextColor } from '@/app/utils/colors/getContrastTextColor'

import { colorStringToHsl } from '../utils/colors/colorStringToHsl'

type Props = {
	text: string
	color: string
	onClick?: () => void
}

export const ColoredChip = ({ text, color, onClick }: Props) => {
	const textColor = getContrastTextColor(color ?? '#eee')

	const parsedColor = colorStringToHsl(color)

	return (
		<Chip
			size="small"
			sx={{
				height: '1.6em',
				'& .MuiChip-label': { fontSize: '1em' },
				color: textColor,
				transition: 'none',
			}}
			style={{
				background: `linear-gradient(90deg,
					hsl(${parsedColor.h * 360 - 15}deg, ${parsedColor.s * 100}%, ${parsedColor.l * 100}%) 0%,
					hsl(${parsedColor.h * 360 + 0}deg, ${parsedColor.s * 100}%, ${parsedColor.l * 100}%) 50%,
					hsl(${parsedColor.h * 360 + 15}deg, ${parsedColor.s * 100}%, ${parsedColor.l * 100}%) 100%)`,
			}}
			onClick={() => onClick?.()}
			label={text}
		/>
	)
}
