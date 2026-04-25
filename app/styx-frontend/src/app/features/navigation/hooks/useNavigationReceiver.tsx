import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

export const useNavigationReceiver = () => {
	const navigate = useStableNavigate({ from: '/world/$worldId' })

	useEventBusSubscribe['world/requestNavigation']({
		callback: (params) => {
			const isAlreadyOnEntityPage = (() => {
				if (!params.search || typeof params.search !== 'function') {
					return false
				}
				const result = params.search({})
				if (!result || typeof result !== 'object') {
					return false
				}
				const { navi } = result
				if (!navi || navi.length !== 1) {
					return false
				}
				const targetGuid = navi[0]
				const currentSearch = new URLSearchParams(window.location.search)
				const currentNavi = currentSearch.get('navi')
				const isNaviStackEmpty = !currentNavi || currentNavi === '[]'
				return isNaviStackEmpty && window.location.pathname.includes(targetGuid)
			})()
			if (isAlreadyOnEntityPage) {
				return
			}
			navigate({
				search: true,
				...params,
			})
		},
	})
}
