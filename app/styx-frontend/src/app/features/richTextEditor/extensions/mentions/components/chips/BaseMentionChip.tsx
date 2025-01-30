import Article from '@mui/icons-material/Article'
import Event from '@mui/icons-material/Event'
import Person from '@mui/icons-material/Person'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'

import { MentionedEntity } from '@/app/features/worldTimeline/types'
import { colorStringToHsl } from '@/app/utils/colors/colorStringToHsl'
import { getContrastTextColor } from '@/app/utils/colors/getContrastTextColor'
import { hslToHex } from '@/app/utils/colors/hslToHex'
import { useCustomTheme } from '@/hooks/useCustomTheme'

type Props = {
	type: MentionedEntity
	label: string
	color: string | undefined
	onClick: () => void
}

export const BaseMentionChip = ({ type, label, color, onClick }: Props) => {
	const parsedColor = colorStringToHsl(color ?? '#000')
	const theme = useCustomTheme()

	// parsedColor.l = 1
	// const textColor = getContrastTextColor(hslToHex(parsedColor.h, parsedColor.s, parsedColor.l))

	// const typeColor = {
	// 	...parsedColor,
	// 	l: parsedColor.l > 0.5 ? parsedColor.l - 0.2 : parsedColor.l + 0.2,
	// }
	const typeColor = parsedColor
	const iconColor = getContrastTextColor(hslToHex(typeColor.h, typeColor.s, typeColor.l))

	const iconSlotSize = `26px`
	const transparency = theme.mode === 'dark' ? 0.25 : 0.35

	return (
		<Stack direction="row" spacing={1} display={'inline'} position={'relative'}>
			<Chip
				size="small"
				sx={{
					height: '1.6em',
					'& .MuiChip-label': { fontSize: '1em', height: '1.6em' },
					// color: textColor,
				}}
				onClick={() => onClick()}
				style={{
					paddingLeft: iconSlotSize,
					paddingRight: '4px',
					marginLeft: '1px',
					marginRight: '1px',
					background: `linear-gradient(90deg,
					hsl(${typeColor.h * 360 - 15}deg, ${typeColor.s * 100}%, ${typeColor.l * 100}%) 0,
					hsl(${typeColor.h * 360 + 15}deg, ${typeColor.s * 100}%, ${typeColor.l * 100}%) ${iconSlotSize}	,
					hsl(${parsedColor.h * 360 - 15}deg, ${parsedColor.s * 100}%, ${parsedColor.l * 100}%, ${transparency}) ${iconSlotSize},
					hsl(${parsedColor.h * 360 + 0}deg, ${parsedColor.s * 100}%, ${parsedColor.l * 100}%, ${transparency}) 50%,
					hsl(${parsedColor.h * 360 + 15}deg, ${parsedColor.s * 100}%, ${parsedColor.l * 100}%, ${transparency}) 100%`,
				}}
				label={label}
			/>
			{type === 'Actor' && (
				<Person sx={{ position: 'absolute', left: -3, top: 1, fontSize: 19, color: iconColor }} />
			)}
			{type === 'Event' && (
				<Event sx={{ position: 'absolute', left: -2, top: 2, fontSize: 17, color: iconColor }} />
			)}
			{type === 'Article' && (
				<Article sx={{ position: 'absolute', left: -1, top: 2, fontSize: 17, color: iconColor }} />
			)}
		</Stack>
	)
}
