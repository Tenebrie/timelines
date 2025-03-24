import Stack from '@mui/material/Stack'

import { ShareWorldModal } from '@/app/views/world/views/settings/modals/ShareWorldModal'
import { SettingsSuspense } from '@/app/views/world/views/settings/SettingsSuspense'

export const Settings = () => {
	return (
		<Stack sx={{ marginTop: 4, alignItems: 'center' }}>
			<SettingsSuspense />
			<ShareWorldModal />
		</Stack>
	)
}
