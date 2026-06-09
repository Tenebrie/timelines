import Typography from '@mui/material/Typography'

import { useFormatTimestamp } from '@/app/features/time/calendar/hooks/useFormatTimestamp'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'

import { BoxedWikiEntity } from '../hooks/useBoxedWikiContent'

type Props = {
	entity: BoxedWikiEntity
}

export function ArticleListItemSecondary({ entity }: Props) {
	const { calendar } = useWorldTime()
	const formatTimestamp = useFormatTimestamp({
		calendar,
	})

	if (entity.type === 'actor' && entity.entity.title) {
		return (
			<Typography variant="caption" sx={{ fontWeight: 500, lineHeight: '1.1rem' }}>
				{entity.entity.title}
			</Typography>
		)
	}

	if (entity.type === 'tag') {
		return (
			<Typography variant="caption" sx={{ fontWeight: 500, lineHeight: '1.1rem' }}>
				3 references
			</Typography>
		)
	}

	if (entity.type === 'event') {
		return (
			<Typography variant="caption" sx={{ fontWeight: 500, lineHeight: '1.1rem' }}>
				{formatTimestamp({ timestamp: entity.entity.timestamp })}
			</Typography>
		)
	}
	return null
}
