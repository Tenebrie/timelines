import { useListWorldShareLinksQuery } from '@api/otherApi'
import { WorldDetails } from '@api/types/worldTypes'
import { GetWorldCollaboratorsApiResponse } from '@api/worldCollaboratorsApi'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'

import { CalendarSelector } from '@/app/features/time/calendar/components/CalendarSelector'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { useEditWorld } from '@/app/views/world/views/settings/api/useEditWorld'
import { useSettingsDraft } from '@/app/views/world/views/settings/hooks/useSettingsDraft'
import { AccessModeSection } from '@/app/views/world/views/settings/sections/AccessModeSection'
import { CollaboratorsSection } from '@/app/views/world/views/settings/sections/CollaboratorsSection'

import { ShareLinksSection } from './sections/ShareLinksSection'

type Props = {
	world: WorldDetails
	collaborators: GetWorldCollaboratorsApiResponse
}

export const Settings = ({ world, collaborators }: Props) => {
	const state = useSettingsDraft({ world })
	const { name, description, setName, setDescription } = state
	const { isSaving, manualSave, autosaveIcon, autosaveColor } = useEditWorld({ world, state })

	const { data: shareLinks } = useListWorldShareLinksQuery({ worldId: world.id })

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		manualSave()
	})

	return (
		<Stack gap={2} marginTop={1}>
			<TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
			<TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
			<CalendarSelector
				worldId={world.id}
				value={state.calendars[0]}
				onChange={(value) => state.setCalendars([value])}
			/>
			<Divider />
			<AccessModeSection world={world} />
			<Divider />
			{collaborators && collaborators.length > 0 && (
				<Stack gap={2}>
					<CollaboratorsSection worldId={world.id} collaborators={collaborators} />
					<Divider />
				</Stack>
			)}
			<Stack gap={2}>
				<ShareLinksSection worldId={world.id} links={shareLinks ?? []} />
				<Divider />
			</Stack>
			<Stack direction="row" justifyContent="flex-end" gap={2}>
				<Tooltip title={shortcutLabel} arrow placement="top">
					<Button
						loading={isSaving}
						variant="outlined"
						onClick={manualSave}
						loadingPosition="start"
						color={autosaveColor}
						startIcon={autosaveIcon}
					>
						Save
					</Button>
				</Tooltip>
			</Stack>
		</Stack>
	)
}
