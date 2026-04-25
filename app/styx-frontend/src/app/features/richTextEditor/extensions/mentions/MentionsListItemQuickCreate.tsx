import Box from '@mui/material/Box'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'

import { EntityIcon } from '@/ui-lib/icons/EntityIcon'

type Props = {
	type: 'Actor' | 'Event' | 'Article' | 'Tag'
	selected: boolean
	onClick: () => void
	query: string
}

export function MentionsListItemQuickCreate({ type, selected, onClick, query }: Props) {
	return (
		<MenuItem
			selected={selected}
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
			<ListItemIcon sx={{ color: 'text.secondary', marginLeft: '-4px', marginRight: -1 }}>
				<EntityIcon variant={type} height={16} />
			</ListItemIcon>
			<ListItemText sx={{ color: 'text.secondary', flexGrow: 0, marginRight: 1 }}>{type}:</ListItemText>
			<ListItemText>{query}</ListItemText>
			<Box
				component="span"
				sx={{
					color: 'secondary.main',
					fontSize: '0.7rem',
					textTransform: 'uppercase',
					whiteSpace: 'nowrap',
					ml: 1,
					fontFamily: 'Inter',
				}}
			>
				New
			</Box>
		</MenuItem>
	)
}
