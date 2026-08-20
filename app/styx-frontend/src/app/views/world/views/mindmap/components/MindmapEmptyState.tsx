import Hub from '@mui/icons-material/Hub'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export function MindmapEmptyState() {
	return (
		<Stack
			alignItems="center"
			justifyContent="center"
			gap={1}
			sx={{
				position: 'absolute',
				inset: 0,
				color: 'text.disabled',
				textAlign: 'center',
				userSelect: 'none',
			}}
		>
			<Hub sx={{ fontSize: 48 }} />
			<Typography variant="h6">The mindmap is empty!</Typography>
			<Typography variant="body2">
				Drag something in from the sidebar, or right click here to add a node.
			</Typography>
		</Stack>
	)
}
