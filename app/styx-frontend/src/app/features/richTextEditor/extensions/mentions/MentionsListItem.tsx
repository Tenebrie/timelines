import Box from '@mui/material/Box'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'

import { useEntityColor } from '@/app/utils/colors/useEntityColor'
import { HighlightedText } from '@/ui-lib/components/HighlightedText/HighlightedText'
import { EntityIcon } from '@/ui-lib/icons/EntityIcon'

import { Mention } from './hooks/useDisplayedMentions'

type Props = {
	mention: Mention
	query: string
	selected: boolean
	onClick: () => void
}

export function MentionsListItem({ mention, query, selected, onClick }: Props) {
	const [entityId, entityColor] = (() => {
		if (mention.type === 'Actor') {
			return [mention.actor.id, mention.actor.color] as const
		}
		if (mention.type === 'Event') {
			return [mention.event.id, mention.event.color] as const
		}
		if (mention.type === 'Article') {
			return [mention.article.id, mention.article.color] as const
		}
		if (mention.type === 'Tag') {
			return [mention.tag.id, '#255'] as const
		}
		throw new Error('Unknown mention type')
	})()
	const color = useEntityColor({ id: entityId, color: entityColor })

	return (
		<MenuItem
			selected={selected}
			key={mention.id}
			onClick={onClick}
			sx={{
				py: 1,
				position: 'relative',
				transition: 'background-color 0.3s !important',
				'&.Mui-selected': { transition: 'background-color 0s !important' },
				'&::before': {
					content: '""',
					position: 'absolute',
					inset: 0,
					transition: 'background-color 0.3s',
					pointerEvents: 'none',
				},
				'&:hover::before': { backgroundColor: 'action.hover', transition: 'background-color 0s' },
				'&:not(.Mui-selected):hover': { backgroundColor: 'transparent !important' },
				'&.Mui-selected:hover': { backgroundColor: 'action.selected !important' },
			}}
		>
			<Stack direction="row" alignItems="center" gap={1} width={1}>
				<ListItemIcon sx={{ marginRight: 0 }}>
					<Stack direction={'row'} gap={1} alignItems={'center'} sx={{ color: 'text.secondary' }}>
						<Box sx={{ backgroundColor: color, width: 12, height: 12, borderRadius: 0.3 }} />
						<EntityIcon variant={mention.type} height={16} />
					</Stack>
				</ListItemIcon>
				<ListItemText>
					<HighlightedText text={mention.name} query={query} />
				</ListItemText>
				<Box
					component="span"
					sx={{
						color: 'text.secondary',
						fontSize: '0.7rem',
						textTransform: 'uppercase',
						whiteSpace: 'nowrap',
						ml: 1,
						fontFamily: 'Inter',
					}}
				>
					{mention.type}
				</Box>
			</Stack>
		</MenuItem>
	)
}
