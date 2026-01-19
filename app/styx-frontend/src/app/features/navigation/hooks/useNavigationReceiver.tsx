import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

export const useNavigationReceiver = () => {
	const navigate = useStableNavigate({ from: '/world/$worldId' })

	useEventBusSubscribe['world/requestNavigation']({
		callback: (params) => {
			navigate({
				search: true,
				...params,
			})
		},
	})
}
