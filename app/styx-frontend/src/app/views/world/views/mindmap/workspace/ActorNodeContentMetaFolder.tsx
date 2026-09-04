import Inventory2 from '@mui/icons-material/Inventory2'
import Stack from '@mui/material/Stack'
import { useMemo } from 'react'

import { useFolderItemCount } from '../../wiki/hooks/useFolderItemCount'
import { BoxedMindmapParent } from '../hooks/useBoxedMindmapContent'

type Props = {
	parent: BoxedMindmapParent
}

export function ActorNodeContentMetaFolder({ parent }: Props) {
	const folderItemCount = useFolderItemCount(parent.id)

	const meta = useMemo(() => {
		return { Icon: Inventory2, label: `${folderItemCount} item${folderItemCount === 1 ? '' : 's'}` }
	}, [folderItemCount])

	return (
		<Stack
			direction="row"
			gap={1}
			sx={{
				alignItems: 'center',
				fontSize: '0.8rem',
				lineHeight: 1.4,
				padding: '8px 16px',
				color: 'text.disabled',
			}}
		>
			<meta.Icon sx={{ fontSize: '1rem' }} />
			{meta.label}
		</Stack>
	)
}
