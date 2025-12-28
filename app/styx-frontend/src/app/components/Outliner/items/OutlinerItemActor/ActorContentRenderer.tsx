import { ActorDetails } from '@api/types/worldTypes'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

import { StyledListItemButton, ZebraWrapper } from '@/app/components/Outliner/items/OutlinerItemActor/styles'
import { TrunkatedTypography } from '@/app/components/TrunkatedTypography'
import { RichTextEditorReadonly } from '@/app/features/richTextEditor/RichTextEditorReadonly'

type Props = {
	actor: ActorDetails
	active: boolean
}

export const EventContentRenderer = ({ actor, active }: Props) => {
	const paragraphs =
		actor.description.length > 0 ? [actor.descriptionRich] : ['<i>No description provided.</i>']

	return (
		<>
			<List disablePadding>
				{paragraphs.map((p, index) => (
					<ZebraWrapper key={p} $zebra={index % 2 === 1}>
						<ListItem disablePadding>
							<StyledListItemButton disableRipple disableTouchRipple sx={{ cursor: 'default' }}>
								<ListItemText
									data-hj-suppress
									primary={
										<TrunkatedTypography
											$lines={10}
											sx={{ fontSize: '16px' }}
											style={{ whiteSpace: 'break-spaces' }}
											component="div"
										>
											<b>Content:</b>
											<RichTextEditorReadonly value={p} />
										</TrunkatedTypography>
									}
									style={{ color: active ? 'inherit' : 'gray' }}
								></ListItemText>
							</StyledListItemButton>
						</ListItem>
					</ZebraWrapper>
				))}
			</List>
		</>
	)
}
