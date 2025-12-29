import { Actor } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { useNavigate } from '@tanstack/react-router'
import { memo } from 'react'
import { useSelector } from 'react-redux'

import { ColorPicker } from '@/app/components/ColorPicker/ColorPicker'
import { ManualErrorBanner } from '@/app/components/ManualErrorBanner'
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
				search: (prev) => ({ ...prev, selection: [createdActor.id] }),
			})
		},
	})

	return (
		<Stack
			gap={1.2}
			sx={{
				height: '100%',
				...useBrowserSpecificScrollbars(),
			}}
		>
			<ActorTitle draft={draft} />
			<Box
				sx={{
					marginBottom: actorColorPickerOpen ? 0 : 0,
					transition: 'margin 300ms',
				}}
			>
				<Collapse
					in={actorColorPickerOpen}
					sx={{ overflow: 'hidden' }}
					timeout={300}
					easing={'ease-in-out'}
					mountOnEnter
					unmountOnExit
				>
					<ColorPicker key={draft.id} initialValue={draft.color} onChangeHex={draft.setColor} />
				</Collapse>
			</Box>
			<Box
				sx={{
					marginBottom: draft.description.length > 0 && draft.name.length === 0 ? 0 : -1.2,
					transition: 'margin 300ms',
				}}
			>
				<ManualErrorBanner
					open={draft.description.length > 0 && draft.name.length === 0}
					error="Actor must have a name"
					severity="info"
				/>
			</Box>
			<Box flexGrow={1} sx={{ marginTop: -1, height: 0 }}>
				<ActorDescription draft={draft} />
			</Box>
		</Stack>
	)
}
