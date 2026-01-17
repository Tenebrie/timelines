import { Actor } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useNavigate } from '@tanstack/react-router'
import { memo } from 'react'
import { useSelector } from 'react-redux'

import { ColorPicker } from '@/app/components/ColorPicker/ColorPicker'
import { IconPicker } from '@/app/components/IconPicker/IconPicker'
import { ManualErrorBanner } from '@/app/components/ManualErrorBanner'
import { EntityEditorTabs } from '@/app/features/entityEditor/components/EntityEditorTabs'
import { getEditingPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'

import { useCurrentOrNewActor } from '../hooks/useCurrentOrNewActor'
import { ActorDescription } from './components/ActorDescription'
import { ActorTitle } from './components/ActorTitle'
import { useActorDraft } from './draft/useActorDraft'
import { useUpsertActor } from './draft/useUpsertActor'

type Props = {
	editedActor: Actor | null
}

export const ActorDetails = memo(ActorDetailsComponent)

export function ActorDetailsComponent({ editedActor }: Props) {
	const { mode, actor } = useCurrentOrNewActor({ editedActor })
	const draft = useActorDraft({ actor })
	const navigate = useNavigate({ from: '/world/$worldId/timeline' })
	const { actorColorPickerOpen } = useSelector(
		getEditingPreferences,
		(a, b) => a.actorColorPickerOpen === b.actorColorPickerOpen,
	)

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
			<Box
				sx={{
					marginBottom: draft.description.length > 0 && draft.name.length === 0 ? -1.5 : -1,
					transition: 'margin 300ms',
				}}
			>
				<ManualErrorBanner
					open={draft.description.length > 0 && draft.name.length === 0}
					error="Actor must have a name"
					severity="info"
				/>
			</Box>
			<Box flexGrow={1} height={0} sx={{ marginRight: 0 }}>
				<EntityEditorTabs
					contentTab={<ActorDescription draft={draft} />}
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
