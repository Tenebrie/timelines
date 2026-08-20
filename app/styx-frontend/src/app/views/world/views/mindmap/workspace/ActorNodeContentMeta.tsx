import AlternateEmail from '@mui/icons-material/AlternateEmail'
import History from '@mui/icons-material/History'
import Inventory2 from '@mui/icons-material/Inventory2'
import Schedule from '@mui/icons-material/Schedule'
import Stack from '@mui/material/Stack'
import { useMemo } from 'react'

import { useFormatTimestamp } from '@/app/features/time/calendar/hooks/useFormatTimestamp'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { formatTimeAgo } from '@/app/views/home/utils/formatTimeAgo'

import { BoxedMindmapParent } from '../hooks/useBoxedMindmapContent'

type Props = {
	parent: BoxedMindmapParent
}

export function ActorNodeContentMeta({ parent }: Props) {
	const { calendar } = useWorldTime()
	const formatTimestamp = useFormatTimestamp({ calendar })

	const meta = useMemo(() => {
		if (parent.type === 'event') {
			return { Icon: Schedule, label: formatTimestamp({ timestamp: parent.entity.timestamp }) }
		}
		if (parent.type === 'tag') {
			const mentionCount = parent.entity.mentionedIn.length
			return { Icon: AlternateEmail, label: `${mentionCount} mention${mentionCount === 1 ? '' : 's'}` }
		}
		if (parent.type === 'folder') {
			const itemCount = parent.entity.children.length
			return { Icon: Inventory2, label: `${itemCount} item${itemCount === 1 ? '' : 's'}` }
		}
		return { Icon: History, label: `Updated ${formatTimeAgo(new Date(parent.entity.updatedAt))}` }
	}, [parent, formatTimestamp])

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
