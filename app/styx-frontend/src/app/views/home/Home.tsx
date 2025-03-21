import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'

import { WorldList } from './components/WorldList/WorldList'

export const Home = () => {
	return (
		<Stack width="100%" height="100%" alignItems="center" justifyContent="center">
			<Container sx={{ marginTop: 4 }}>
				<WorldList />
			</Container>
		</Stack>
	)
}
