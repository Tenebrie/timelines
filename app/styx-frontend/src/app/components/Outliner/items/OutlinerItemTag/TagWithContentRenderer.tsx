import { WorldTag } from '@api/types/worldTypes'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemText from '@mui/material/ListItemText'
import { memo } from 'react'
import { TransitionGroup } from 'react-transition-group'

import { TagMentionedBy } from '@/app/features/entityEditor/tag/details/components/TagMentionedBy'

import { StyledListItemButton } from '../OutlinerItemActor/styles'
import { TagRenderer } from './TagRenderer'

type Props = {
	tag: WorldTag
	collapsed: boolean
	actions: readonly ('edit' | 'collapse')[]
}

export const TagWithContentRenderer = memo(TagWithContentRendererComponent)

function TagWithContentRendererComponent({ tag, collapsed, actions }: Props) {
	return (
		<>
			<TagRenderer tag={tag} collapsed={collapsed} actions={actions} />
			<List dense component="div" disablePadding>
				<TransitionGroup>
					{!collapsed && (
						<Collapse>
							<StyledListItemButton
								disableRipple
								disableTouchRipple
								sx={{ cursor: 'default', paddingBottom: 1.5 }}
							>
								<ListItemText primary={<TagMentionedBy tagId={tag.id} />}></ListItemText>
							</StyledListItemButton>
						</Collapse>
					)}
				</TransitionGroup>
			</List>
			<Divider />
		</>
	)
}
