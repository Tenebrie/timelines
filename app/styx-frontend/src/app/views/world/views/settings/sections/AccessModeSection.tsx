import { useListWorldAccessModesQuery } from '@api/otherApi'
import { WorldAccessMode, WorldBrief } from '@api/types/worldTypes'
import { useSetWorldAccessModeMutation } from '@api/worldDetailsApi'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { ReactNode, useCallback } from 'react'

type Props = {
	world: WorldBrief
}

const translations: Record<WorldAccessMode, ReactNode> = {
	Private: (
		<span>
			<b>Private:</b> <>Only invited users can see</>
		</span>
	),
	PublicRead: (
		<span>
			<b>Public Share:</b> <>Anyone with a link can see</>
		</span>
	),
	PublicEdit: (
		<span>
			<b>Public Wiki:</b> <>Any logged in user can edit</>
		</span>
	),
}

export const AccessModeSection = ({ world }: Props) => {
	const { data: accessModes } = useListWorldAccessModesQuery()
	const [setWorldAccessMode] = useSetWorldAccessModeMutation()

	const onSelectionChanged = useCallback(
		(value: WorldBrief['accessMode']) => {
			setWorldAccessMode({
				worldId: world.id,
				body: {
					access: value,
				},
			})
		},
		[setWorldAccessMode, world.id],
	)

	const onCopyLink = useCallback(() => {
		const link = window.location.origin + `/world/${world.id}`
		navigator.clipboard.writeText(link)
	}, [world])

	return (
		<Stack gap={2}>
			<FormControl fullWidth>
				<InputLabel id="world-calendar-label">Access</InputLabel>
				<Select
					value={world.accessMode}
					label="Access"
					labelId="world-access-mode"
					onChange={(event) => onSelectionChanged(event.target.value as WorldAccessMode)}
				>
					{accessModes &&
						accessModes.map((option) => (
							<MenuItem key={option} value={option}>
								{translations[option]}
							</MenuItem>
						))}
					{!accessModes && <MenuItem value={world.accessMode}>{translations[world.accessMode]}</MenuItem>}
				</Select>
			</FormControl>
			{world.accessMode !== 'Private' && <Button onClick={onCopyLink}>Copy Link to Clipboard</Button>}
		</Stack>
	)
}
