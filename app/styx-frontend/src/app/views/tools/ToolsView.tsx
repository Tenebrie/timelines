import Stack from '@mui/material/Stack'

import { BaseNavigator } from '@/app/features/navigation/components/BaseNavigator'

import { Tools } from './Tools'

export function ToolsView() {
	return (
		<Stack width="100%" height="100%" alignItems="center" justifyContent="center">
			<BaseNavigator />
			<Tools />
		</Stack>
	)
}
