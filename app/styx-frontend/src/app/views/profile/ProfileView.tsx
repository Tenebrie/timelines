import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import FeedbackIcon from '@mui/icons-material/Feedback'
import LockResetIcon from '@mui/icons-material/LockReset'
import StorageIcon from '@mui/icons-material/Storage'
import TuneIcon from '@mui/icons-material/Tune'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { RoutedView } from '@/ui-lib/components/RoutedView/RoutedView'

export function ProfileView() {
	return (
		<Stack position="relative" width="100%" height="100%" alignItems="center">
			<RoutedView
				label="Your Profile"
				routes={[
					{ icon: <AccountCircleIcon />, label: 'Public profile', path: '/profile/public' },
					{ icon: <TuneIcon />, label: 'Preferences', path: '/profile/preferences' },
					{ icon: <StorageIcon />, label: 'Storage', path: '/profile/storage' },
					{ icon: <LockResetIcon />, label: 'Security', path: '/profile/security' },
					{ icon: <FeedbackIcon />, label: 'Feedback', path: '/profile/feedback' },
				]}
				footer={
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ mt: 'auto', pt: 4, display: 'block', textAlign: 'center', opacity: 0.6 }}
					>
						Build <b>{__APP_VERSION__}</b> <b>({new Date(__BUILD_TIME__).toLocaleString('sv-SE')})</b>
					</Typography>
				}
			/>
		</Stack>
	)
}
