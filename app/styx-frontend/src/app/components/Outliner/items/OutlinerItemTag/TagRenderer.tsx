import { WorldTag } from '@api/types/worldTypes'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import MenuIcon from '@mui/icons-material/Menu'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { ShowHideChevron } from '@/app/components/ShowHideChevron'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { StyledListItemButton } from '@/app/views/world/views/timeline/shelf/styles'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'
import { PopoverButton } from '@/ui-lib/components/PopoverButton/PopoverButton'

import { TagHeaderRenderer } from './TagHeaderRenderer'

type Props = {
	tag: WorldTag
	collapsed: boolean
	actions: readonly ('edit' | 'collapse')[]
}

export const TagRenderer = ({ tag, collapsed, actions }: Props) => {
	const navigate = useStableNavigate({ from: '/world/$worldId' })
	const { open: openDeleteTagModal } = useModal('deleteTagModal')

	const dispatch = useDispatch()
	const { collapseTagInOutliner, uncollapseTagInOutliner } = preferencesSlice.actions

	const onToggleOpen = useCallback(() => {
		if (!actions.includes('collapse')) {
			return
		}
		if (collapsed) {
			dispatch(uncollapseTagInOutliner(tag))
		} else {
			dispatch(collapseTagInOutliner(tag))
		}
	}, [actions, collapseTagInOutliner, collapsed, dispatch, tag, uncollapseTagInOutliner])

	const secondaryAction = actions.map((action) => {
		switch (action) {
			case 'edit':
				return (
					<PopoverButton
						key={'menu'}
						icon={<MenuIcon />}
						aria-label="Menu"
						size="small"
						tooltip="Show actions"
						popoverAction={() => null}
						popoverBody={({ close }) => (
							<MenuList>
								<MenuItem
									onClick={() => {
										navigate({
											to: '/world/$worldId/timeline',
											search: (prev) => ({ ...prev, navi: [tag.id] }),
										})
										close()
									}}
									data-testid="EditTagButton"
								>
									<ListItemIcon>
										<EditIcon />
									</ListItemIcon>
									<ListItemText>Edit</ListItemText>
								</MenuItem>
								<MenuItem
									onClick={() => {
										openDeleteTagModal({ target: tag })
										close()
									}}
									data-testid="DeleteTagButton"
								>
									<ListItemIcon>
										<DeleteIcon />
									</ListItemIcon>
									<ListItemText>Delete</ListItemText>
								</MenuItem>
							</MenuList>
						)}
					/>
				)
			case 'collapse':
				return (
					<IconButton
						key={'collapse'}
						sx={{ marginRight: 2 }}
						onClick={onToggleOpen}
						aria-label="Expand or collapse"
					>
						<ShowHideChevron collapsed={collapsed} />
					</IconButton>
				)
		}
	})

	return (
		<ListItem disableGutters disablePadding secondaryAction={secondaryAction}>
			<StyledListItemButton onClick={onToggleOpen}>
				<TagHeaderRenderer tag={tag} />
			</StyledListItemButton>
		</ListItem>
	)
}
