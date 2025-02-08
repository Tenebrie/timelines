import { useNavigate } from '@tanstack/react-router'

import { useEventBusSubscribe } from '@/app/features/eventBus'

export const useNavigationReceiver = () => {
	const navigate = useNavigate({ from: '/world/$worldId' })

	useEventBusSubscribe({
		event: 'navigate/world',
		callback: (params) => {
			navigate(params)
		},
	})
}
