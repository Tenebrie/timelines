import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/features/worldTimeline/selectors'

export const WorldHeader = () => {
	const { name } = useSelector(getWorldState)

	return (
		<div style={{ position: 'relative', height: 100 }}>
			<div
				style={{
					position: 'absolute',
					backgroundImage: 'url(https://image.lexica.art/full_webp/b707ce67-d80e-4318-a0e1-228165dd2917)',
					backgroundSize: 'cover',
					filter: 'blur(0px)',
					top: -16,
					left: -16,
					width: 'calc(100% + 32px)',
					height: '116px',
				}}
			></div>
			<div style={{ position: 'absolute', top: 8, left: 8 }}>
				<Stack alignItems="center" direction="row" width="100%" justifyContent="center" gap={2}>
					<Stack gap={0}>
						<Typography variant="h5">{name}</Typography>
					</Stack>
				</Stack>
				<Typography variant="caption">User's description</Typography>
			</div>
		</div>
	)
}
