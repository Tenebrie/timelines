import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { QuickSelectListSectionHeader } from './QuickSelectListSectionHeader'

export function QuickSelectListWelcomeState() {
	return (
		<Stack data-testid="QuickSelectListWelcomeState">
			<QuickSelectListSectionHeader label="Quick create" disableGutter />
			<Divider style={{ marginBottom: 0 }} />
			<Stack sx={{ padding: '12px 16px 12px', gap: 1.5 }}>
				<Typography variant="body2" sx={{ color: 'text.disabled' }}>
					Type the name of your thingy to create one!
				</Typography>
			</Stack>
		</Stack>
	)
}
