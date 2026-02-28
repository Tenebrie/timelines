import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'

import { WorldList } from './components/WorldList/WorldList'

export const WorldManagementView = () => {
	return (
		<Stack width="100%" height="100%" alignItems="center" sx={{ overflowY: 'auto' }}>
			<Container maxWidth="md" sx={{ py: 4 }}>
				<WorldList />
			</Container>
		</Stack>
	)
}
