import { useGetTagDetailsQuery } from '@api/otherApi'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSelector } from 'react-redux'

import { ActorMentionChip } from '@/app/features/richTextEditor/extensions/mentions/components/chips/ActorMentionChip'
import { ArticleMentionChip } from '@/app/features/richTextEditor/extensions/mentions/components/chips/ArticleMentionChip'
import { EventMentionChip } from '@/app/features/richTextEditor/extensions/mentions/components/chips/EventMentionChip'
import { TagMentionChip } from '@/app/features/richTextEditor/extensions/mentions/components/chips/TagMentionChip'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

type Props = {
	tagId: string
}

export const TagMentionedBy = ({ tagId }: Props) => {
	const { id: worldId } = useSelector(getWorldState, (a, b) => a.id === b.id)

	const { data, isLoading } = useGetTagDetailsQuery({ worldId, tagId }, { refetchOnMountOrArgChange: true })

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" py={2}>
				<CircularProgress size={24} />
			</Box>
		)
	}

	const mentionedBy = data?.mentionedBy ?? []

	if (mentionedBy.length === 0) {
		return (
			<Stack gap={1}>
				<Typography variant="subtitle2" color="text.secondary">
					Mentioned by
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
					No entities mention this tag yet.
				</Typography>
			</Stack>
		)
	}

	return (
		<Stack gap={1}>
			<Typography variant="subtitle2" color="text.secondary">
				Mentioned by
			</Typography>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
				{mentionedBy.map((entity) => {
					if (entity.type === 'Actor') {
						return <ActorMentionChip key={entity.id} worldId={worldId} actorId={entity.id} />
					}
					if (entity.type === 'Event') {
						return <EventMentionChip key={entity.id} worldId={worldId} eventId={entity.id} />
					}
					if (entity.type === 'Article') {
						return <ArticleMentionChip key={entity.id} worldId={worldId} articleId={entity.id} />
					}
					if (entity.type === 'Tag') {
						return <TagMentionChip key={entity.id} worldId={worldId} tagId={entity.id} />
					}
					return null
				})}
			</Box>
		</Stack>
	)
}
