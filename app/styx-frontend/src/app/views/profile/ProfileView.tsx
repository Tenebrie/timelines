import Stack from '@mui/material/Stack'

import { BaseNavigator } from '@/app/features/navigation/components/BaseNavigator'

import { Profile } from './Profile'

export function ProfileView() {
	return (
		<Stack position="relative" width="100%" height="100%" alignItems="center">
			<BaseNavigator />
			<Profile />
		</Stack>
	)
}
