import { WorldTag } from '@api/types/worldTypes'
import { useTheme } from '@mui/material'
import ListItemIcon from '@mui/material/ListItemIcon'

import { EventIcon } from '@/app/features/icons/components/EventIcon'
import { StyledListItemText } from '@/app/views/world/views/timeline/shelf/styles'

import { ShortText } from '../OutlinerItemEvent/styles'

type Props = {
	tag: WorldTag
}

export const TagHeaderRenderer = ({ tag }: Props) => {
	const theme = useTheme()

	const pluralStr = tag.mentionedIn.length === 1 ? '' : 's'

	return (
		<>
			<ListItemIcon>
				<EventIcon name={'material-symbols:label'} height={24} />
			</ListItemIcon>
			<StyledListItemText
				sx={{
					paddingRight: 6,
				}}
				data-hj-suppress
				primary={
					<ShortText
						style={{ fontWeight: theme.typography.fontWeightBold, color: theme.palette.secondary.main }}
					>
						{tag.name}
					</ShortText>
				}
				secondary={`Tag with ${tag.mentionedIn.length} mention${pluralStr}`}
			/>
		</>
	)
}
