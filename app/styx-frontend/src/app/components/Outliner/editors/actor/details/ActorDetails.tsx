import { Actor } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { memo } from 'react'

import { ColorPicker } from '@/app/components/ColorPicker/ColorPicker'
import { IconPicker } from '@/app/components/IconPicker/IconPicker'
import { EntityEditorTabs } from '@/app/features/entityEditor/components/EntityEditorTabs'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { useCurrentOrNewActor } from '../hooks/useCurrentOrNewActor'
import { ActorDescription } from './components/ActorDescription'
import { ActorTitle } from './components/ActorTitle'
import { useActorDraft } from './draft/useActorDraft'
import { useUpsertActor } from './draft/useUpsertActor'

type Props = {
	editedActor: Actor
}

export const ActorDetails = memo(ActorDetailsComponent)

export function ActorDetailsComponent({ editedActor }: Props) {
	const { mode, actor } = useCurrentOrNewActor({ editedActor })
	const draft = useActorDraft({ actor })
	const navigate = useStableNavigate({ from: '/world/$worldId/timeline' })

	useUpsertActor({
		mode,
		draft,
		onCreate: (createdActor) => {
			navigate({
				to: '/world/$worldId/mindmap',
				search: (prev) => ({ ...prev, navi: [createdActor.id] }),
			})
		},
	})

	return (
		<Stack
			gap={1}
			sx={{
				height: '100%',
				...useBrowserSpecificScrollbars(),
			}}
		>
			<ActorTitle draft={draft} />
			<Box flexGrow={1} height={0} sx={{ marginRight: 0 }}>
				<EntityEditorTabs
					contentTab={<ActorDescription actor={actor} />}
					illustrationTab={
						<Stack gap={2} sx={{ height: '100%', overflow: 'auto', marginRight: -0.5 }}>
							<Stack gap={2} sx={{ marginRight: 2 }}>
								<ColorPicker key={draft.id} initialValue={draft.color} onChangeHex={draft.setColor} />
								<IconPicker color={draft.color} defaultQuery={draft.icon} onSelect={draft.setIcon} />
							</Stack>
						</Stack>
					}
				/>
			</Box>
		</Stack>
	)
}
