import { Sort } from '@mui/icons-material'
import { Collapse, IconButton, List, ListItem, ListItemButton, ListSubheader } from '@mui/material'
import { MouseEvent, ReactNode } from 'react'

import { ExpandIcon } from './styles'

type Props<T> = {
	title: string
	open: boolean
	reversed: boolean
	onToggleOpen: (value: boolean) => void
	onToggleReversed: (value: boolean) => void
	entities: T[]
	renderEntity: (entity: T) => ReactNode
}

export function OverviewSublist<T extends { id: string }>({
	title,
	open,
	reversed,
	onToggleOpen,
	onToggleReversed,
	entities,
	renderEntity,
}: Props<T>) {
	const onSortClick = (event: MouseEvent) => {
		event.stopPropagation()
		onToggleOpen(true)
		onToggleReversed(!reversed)
	}

	const displayedEntities = reversed ? [...entities].reverse() : entities
	return (
		<>
			<ListSubheader
				key={title}
				component={ListItem}
				onClick={() => onToggleOpen(!open)}
				disablePadding
				disableGutters
				secondaryAction={[
					<IconButton key={'sort'} onClick={onSortClick}>
						<Sort />
					</IconButton>,
				]}
			>
				<ListItemButton>
					{title} <ExpandIcon rotated={open ? 1 : 0} />
				</ListItemButton>
			</ListSubheader>

			<Collapse in={open} timeout="auto" unmountOnExit>
				<List component="div" disablePadding>
					{displayedEntities.map((entity) => (
						<ListItem key={entity.id} disablePadding role="listitem">
							{renderEntity(entity)}
						</ListItem>
					))}
				</List>
			</Collapse>
		</>
	)
}
