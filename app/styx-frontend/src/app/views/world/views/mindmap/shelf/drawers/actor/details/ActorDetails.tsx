import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useNavigate } from '@tanstack/react-router'
import { memo } from 'react'
import { useSelector } from 'react-redux'

import { ColorPicker } from '@/app/components/ColorPicker/ColorPicker'
import { getEditingPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'

import { useCurrentOrNewActor } from '../hooks/useCurrentOrNewActor'
import { ActorDescription } from './components/ActorDescription'
import { ActorTitle } from './components/ActorTitle'
import { useActorDraft } from './draft/useActorDraft'
import { useUpsertActor } from './draft/useUpsertActor'

export const ActorDetails = memo(ActorDetailsComponent)

export function ActorDetailsComponent() {
	const { mode, actor } = useCurrentOrNewActor()
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
			gap={1}
			sx={{
				padding: '24px 16px',
				overflowY: 'auto',
				...useBrowserSpecificScrollbars(),
			}}
		>
			<ActorTitle actor={actor} draft={draft} />
			<Divider />
			<Box sx={{ paddingBottom: actorColorPickerOpen ? 1 : 0, transition: 'padding 300ms' }}>
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
			<Box flexGrow={1} sx={{ marginTop: -1 }}>
				<ActorDescription draft={draft} />
			</Box>
		</Stack>
	)
}
