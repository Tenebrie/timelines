import { useGetWorldThumbnailMetadataQuery } from '@api/worldThumbnailApi'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSelector } from 'react-redux'

import { darkTheme, lightTheme } from '@/app/features/theming/themes'
import { getWorldState } from '@/app/features/worldTimeline/selectors'

export const WorldHeader = () => {
	const {
		id: worldId,
		name,
		description,
	} = useSelector(
		getWorldState,
		(a, b) => a.id === b.id && a.name === b.name && a.description === b.description,
	)
	const { data } = useGetWorldThumbnailMetadataQuery({ worldId }, { skip: !worldId })

	if (!data) {
		return null
	}

	const textColor = data.color.isDark ? darkTheme.palette.text.primary : lightTheme.palette.text.primary

	return (
		<div style={{ position: 'relative', height: 108 }}>
			<div
				style={{
					position: 'absolute',
					backgroundImage: `url(/api/world/${worldId}/thumbnail)`,
					backgroundSize: 'cover',
					filter: 'blur(0px)',
					top: -16,
					left: -16,
					width: 'calc(100% + 32px)',
					height: 'calc(100% + 16px)',
				}}
			></div>
			<div style={{ position: 'absolute', top: 8, left: 8, width: '100%' }}>
				<Stack alignItems="center" direction="row" width="100%" justifyContent="center" gap={2}>
					<Stack gap={0} width="100%">
						<Typography variant="h5" noWrap color={textColor} sx={{ width: '100%' }}>
							{name}
						</Typography>
					</Stack>
				</Stack>
				<Typography
					variant="caption"
					sx={{
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						display: '-webkit-box',
						WebkitLineClamp: '3',
						WebkitBoxOrient: 'vertical',
					}}
				>
					{description}
				</Typography>
			</div>
		</div>
	)
}
