import Stack from '@mui/material/Stack'

import { BaseNavigator } from '@/app/features/navigation/components/BaseNavigator'

import { Admin } from './Admin'

export const AdminView = () => {
	return (
		<Stack position="relative" width="100%" height="100%" alignItems="center">
			<BaseNavigator />
			<Admin />
		</Stack>
	)
}
