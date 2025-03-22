import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'

import { Tools } from './Tools'

export function ToolsView() {
	return (
		<Stack width="100%" height="100%">
			<Container maxWidth="sm" sx={{ marginTop: 4 }}>
				<Tools />
			</Container>
		</Stack>
	)
}
