import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

import { ActorDetails } from '@/api/types/worldTypes'
import { StyledListItemButton, ZebraWrapper } from '@/app/components/Outliner/items/OutlinerItemActor/styles'
import { TruncatedTypography } from '@/app/components/TruncatedTypography'
import { RichTextEditorReadonly } from '@/app/features/richTextEditor/RichTextEditorReadonly'

type Props = {
	actor: ActorDetails
	active: boolean
}

export const ActorContentRenderer = ({ actor, active }: Props) => {
	const paragraphs = actor.content.length > 0 ? [actor.contentRich] : ['<i>No description provided.</i>']

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
										<TruncatedTypography
											$lines={10}
											sx={{ fontSize: '16px' }}
											style={{ whiteSpace: 'break-spaces' }}
											component="div"
										>
											<b>Content:</b>
											<RichTextEditorReadonly value={p} />
										</TruncatedTypography>
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
