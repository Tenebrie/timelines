import { useNavigate } from '@tanstack/react-router'

import { useEventBusSubscribe } from '@/app/features/eventBus'

export const useNavigationReceiver = () => {
	const navigate = useNavigate({ from: '/world/$worldId' })

	useEventBusSubscribe({
		event: 'world/requestNavigation',
		callback: (params) => {
			navigate({
				search: true,
				...params,
			})
		},
	})
}
