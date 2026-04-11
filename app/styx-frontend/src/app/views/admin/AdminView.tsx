import Stack from '@mui/material/Stack'

import { RoutedView } from '@/ui-lib/components/RoutedView/RoutedView'

export const AdminView = () => {
	return (
		<Stack position="relative" width="100%" height="100%" alignItems="center">
			<RoutedView
				label="Admin tools"
				routes={[
					{ label: 'Dashboard', path: '/admin/', exact: true },
					{ label: 'Users', path: '/admin/users' },
					{ label: 'Audit Log', path: '/admin/audit' },
				]}
			/>
		</Stack>
	)
}
