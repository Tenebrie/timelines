import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'

import { ShareWorldModal } from '@/app/views/world/views/settings/modals/ShareWorldModal'
import { SettingsSuspense } from '@/app/views/world/views/settings/SettingsSuspense'

export const Settings = () => {
	return (
		<Stack sx={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
			<Paper>
				<SettingsSuspense />
			</Paper>
			<ShareWorldModal />
		</Stack>
	)
}
