import { WorldBrief } from '@api/types/worldTypes'
import Public from '@mui/icons-material/Public'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'

import { WorldListCreateNewButton } from './WorldListCreateNewButton'
import { WorldListItem } from './WorldListItem'

type Props = {
	worlds: WorldBrief[]
	label: string
	showActions?: boolean
	showCreateButton?: boolean
}

export const WorldListSection = ({ worlds, label, showActions, showCreateButton }: Props) => {
	const sortedWorlds = useMemo(() => {
		return [...worlds].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
	}, [worlds])

	return (
		<Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
			<Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
				<Stack direction="row" alignItems="center" gap={2}>
					<Box
						sx={{
							p: 1,
							borderRadius: 1.5,
							bgcolor: 'primary.main',
							color: 'primary.contrastText',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Public fontSize="small" />
					</Box>
					<Typography variant="h6" fontWeight="bold">
						{label}
					</Typography>
				</Stack>
				{showCreateButton && <WorldListCreateNewButton />}
			</Stack>
			<Divider sx={{ mb: 2 }} />
			<Stack gap={0.5}>
				{sortedWorlds.map((world) => (
					<WorldListItem key={world.id} world={world} showActions={showActions} />
				))}
				{sortedWorlds.length === 0 && (
					<Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
						No worlds yet. Click the + button to create one!
					</Typography>
				)}
			</Stack>
		</Paper>
	)
}
