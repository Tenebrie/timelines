import Add from '@mui/icons-material/Add'
import Sort from '@mui/icons-material/Sort'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListSubheader from '@mui/material/ListSubheader'
import { MouseEvent, ReactNode } from 'react'

import { useIsReadOnly } from '@/app/hooks/useIsReadOnly'

import { ExpandIcon } from './styles'

type Props<T> = {
	title: string
	open: boolean
	reversed: boolean
	onAddNew?: () => void
	onToggleOpen: (value: boolean) => void
	onToggleReversed: (value: boolean) => void
	entities: T[]
	renderEntity: (entity: T) => ReactNode
	entityName: string
}

export function OverviewSublist<T extends { id: string }>({
	title,
	open,
	reversed,
	onAddNew,
	onToggleOpen,
	onToggleReversed,
	entities,
	renderEntity,
	entityName,
}: Props<T>) {
	const { isReadOnly } = useIsReadOnly()

	const onAddClick = (event: MouseEvent) => {
		event.stopPropagation()
		if (onAddNew) {
			onAddNew()
		}
	}

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
				secondaryAction={(onAddNew && !isReadOnly
					? [
							<IconButton key={'add'} onClick={onAddClick} aria-label={`Create new ${entityName}`}>
								<Add />
							</IconButton>,
						]
					: []
				).concat([
					<IconButton key={'sort'} onClick={onSortClick} aria-label="Sort">
						<Sort />
					</IconButton>,
				])}
			>
				<ListItemButton>
					{title} <ExpandIcon rotated={open ? 1 : 0} />
				</ListItemButton>
			</ListSubheader>

			<Collapse in={open} timeout="auto" unmountOnExit>
				<List component="div" disablePadding>
					{displayedEntities.map((entity) => renderEntity(entity))}
				</List>
			</Collapse>
		</>
	)
}
