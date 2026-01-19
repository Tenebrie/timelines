import type { IconCollection } from '@api/types/iconTypes'
import { Icon } from '@iconify/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'

import { FavoriteIconCollectionButton } from './FavoriteIconCollectionButton'

type Props = {
	collection: IconCollection
	color: string
	onSelect: (icon: string) => void
}

export function IconCollection({ collection, color, onSelect }: Props) {
	const targetLink = useMemo(() => {
		return `https://icon-sets.iconify.design/${collection.id}/`
	}, [collection])

	return (
		<>
			<Typography variant="h6">
				{collection.procedural && <span>{collection.name}</span>}
				{!collection.procedural && (
					<Link href={targetLink} underline="hover">
						{collection.name}
					</Link>
				)}
				<FavoriteIconCollectionButton collection={collection} />
			</Typography>
			<Stack direction="row" flexWrap="wrap" gap={1}>
				{collection.icons.map((icon, index) => (
					<Button key={index} onClick={() => onSelect(icon)} sx={{ padding: 0.25, minWidth: 'auto' }}>
						<Tooltip title={icon} disableInteractive>
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
						</Tooltip>
					</Button>
				))}
			</Stack>
		</>
	)
}
