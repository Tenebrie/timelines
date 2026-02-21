import Public from '@mui/icons-material/Public'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { WorldListCreateNewButton } from './WorldList/WorldListCreateNewButton'

type Props = {
	label: string
}

export const WorldListEmptyState = ({ label }: Props) => {
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
				<WorldListCreateNewButton />
			</Stack>
			<Divider sx={{ mb: 2 }} />
			<Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
				No worlds yet. Click the + button to create one!
			</Typography>
		</Paper>
	)
}
