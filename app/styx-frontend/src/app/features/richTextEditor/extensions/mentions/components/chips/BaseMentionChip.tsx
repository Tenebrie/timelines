import Article from '@mui/icons-material/Article'
import Event from '@mui/icons-material/Event'
import Person from '@mui/icons-material/Person'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'

import { MentionedEntity } from '@/app/features/worldTimeline/types'
import { colorStringToHsl } from '@/app/utils/colors/colorStringToHsl'
import { getContrastTextColor } from '@/app/utils/colors/getContrastTextColor'

type Props = {
	type: MentionedEntity
	label: string
	color: string | undefined
	onClick: () => void
}

export const BaseMentionChip = ({ type, label, color, onClick }: Props) => {
	const textColor = getContrastTextColor(color ?? '#eee')
	const parsedColor = colorStringToHsl(color ?? '#000')

	const typeColor = {
		...parsedColor,
		l: Math.min(parsedColor.l, 0.2),
	}

	const iconSlotSize = `26px`

	return (
		<Stack direction="row" spacing={1} display={'inline'} position={'relative'}>
			<Chip
				size="small"
				sx={{
					height: '1.6em',
					'& .MuiChip-label': { fontSize: '1em' },
					color: textColor,
				}}
				onClick={() => onClick()}
				style={{
					paddingLeft: iconSlotSize,
					paddingRight: '4px',
					marginLeft: '1px',
					marginRight: '1px',
					background: `linear-gradient(90deg,
					hsl(${typeColor.h * 360 - 15}deg, ${typeColor.s * 100}%, ${typeColor.l * 100}%) 0,
					hsl(${typeColor.h * 360 - 15}deg, ${typeColor.s * 100}%, ${typeColor.l * 100}%) calc(0% + ${iconSlotSize}),
					hsl(${parsedColor.h * 360 - 15}deg, ${parsedColor.s * 100}%, ${parsedColor.l * 100}%) calc(0% + ${iconSlotSize}),
					hsl(${parsedColor.h * 360 + 0}deg, ${parsedColor.s * 100}%, ${parsedColor.l * 100}%) calc(50% + ${iconSlotSize}),
					hsl(${parsedColor.h * 360 + 15}deg, ${parsedColor.s * 100}%, ${parsedColor.l * 100}%) calc(100% + ${iconSlotSize}))`,
				}}
				label={label}
			/>
			{type === 'Actor' && <Person sx={{ position: 'absolute', left: -3, top: 1, fontSize: 20 }} />}
			{type === 'Event' && <Event sx={{ position: 'absolute', left: -3, top: 1, fontSize: 20 }} />}
			{type === 'Article' && <Article sx={{ position: 'absolute', left: -3, top: 1, fontSize: 20 }} />}
		</Stack>
	)
}
