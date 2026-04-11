import DashboardIcon from '@mui/icons-material/Dashboard'
import GavelIcon from '@mui/icons-material/Gavel'
import PeopleIcon from '@mui/icons-material/People'
import Stack from '@mui/material/Stack'

import { RoutedView } from '@/ui-lib/components/RoutedView/RoutedView'

export const AdminView = () => {
	return (
		<Stack position="relative" width="100%" height="100%" alignItems="center">
			<RoutedView
				label="Admin tools"
				routes={[
					{ icon: <DashboardIcon />, label: 'Dashboard', path: '/admin/', exact: true },
					{ icon: <PeopleIcon />, label: 'Users', path: '/admin/users' },
					{ icon: <GavelIcon />, label: 'Audit Log', path: '/admin/audit' },
				]}
			/>
		</Stack>
	)
}
