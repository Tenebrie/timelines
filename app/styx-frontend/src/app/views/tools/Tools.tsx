import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { FilePickerButton } from '@/app/components/FilePickerButton'

export function Tools() {
	return (
		<Paper elevation={2} sx={{ marginTop: 4, padding: 4 }}>
			<Stack direction="column" gap={2}>
				<Typography variant="h5">Image converter</Typography>
				<FilePickerButton />
			</Stack>
		</Paper>
	)
}
