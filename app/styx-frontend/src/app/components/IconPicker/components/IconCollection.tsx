import { Icon } from '@iconify/react'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

type Props = {
	collection: {
		name: string
		icons: string[]
	}
	color: string
	onSelect: (icon: string) => void
}

export function IconCollection({ collection, color, onSelect }: Props) {
	const [favorite, setFavorite] = useState(false)

	return (
		<>
			<Typography variant="h6">
				<span>{collection.name}</span>
				<Button sx={{ p: 0.25, minWidth: 0, marginLeft: 0.25 }} onClick={() => setFavorite(!favorite)}>
					{favorite && <FavoriteIcon />}
					{!favorite && <FavoriteBorderIcon />}
				</Button>
			</Typography>
			<Stack direction="row" flexWrap="wrap" gap={1}>
				{collection.icons.map((icon, index) => (
					<Button key={index} onClick={() => onSelect(icon)} sx={{ padding: 0.25, minWidth: 'auto' }}>
						<Box
							sx={{
								width: 36,
								height: 36,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Icon color={color} icon={icon} width={36} height={36} ssr />
						</Box>
					</Button>
				))}
			</Stack>
		</>
	)
}
