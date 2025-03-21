import Stack from '@mui/material/Stack'
import { useSelector } from 'react-redux'

import { getAuthState } from '@/app/features/auth/AuthSliceSelectors'
import { BaseNavigator } from '@/app/features/navigation/components/BaseNavigator'

import { Profile } from './Profile'

export function ProfileView() {
	const { user } = useSelector(getAuthState)

	return (
		<Stack position="relative" width="100%" height="100%" alignItems="center">
			<BaseNavigator />
			{user && <Profile user={user} />}
		</Stack>
	)
}
