import { Button, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material'
import { ReactNode, useCallback } from 'react'

import { useListWorldAccessModesQuery, useSetWorldAccessModeMutation } from '../../../../../../api/rheaApi'
import { WorldAccessMode, WorldBrief } from '../../../../world/types'

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

export const WorldAccessModeDropdown = ({ world }: Props) => {
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
		[setWorldAccessMode, world.id]
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
