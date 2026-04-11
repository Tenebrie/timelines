import { useSelector } from 'react-redux'

import { getAuthState } from '@/app/features/auth/AuthSliceSelectors'
import { RoutedView } from '@/ui-lib/components/RoutedView/RoutedView'

export function ToolsView() {
	const { user } = useSelector(getAuthState, (a, b) => a.user === b.user)

	const isPremium = user?.level === 'Premium' || user?.level === 'Admin'

	return (
		<RoutedView
			label="Tools"
			routes={[
				{ label: 'Image converter', path: '/tools/image-converter' },
				{ label: 'QR code generator', path: '/tools/qr-generator' },
				{ label: 'AI image generator', path: '/tools/image-generator', isRendered: isPremium },
			]}
		/>
	)
}
