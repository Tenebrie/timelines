import Box from '@mui/material/Box'
import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'

import { portalSlice } from '../../portals/PortalSlice'
import { getPortalState } from '../../portals/PortalSliceSelectors'
import { researchSummonable } from '../../summonable/researchSummonable'

export function NavigatorDeliveryDriver({ children }: { children: ReactNode }) {
	const { deliveryTargets } = useSelector(getPortalState)

	const { findDeliveryTarget } = portalSlice.actions
	const dispatch = useDispatch()

	const [deliveryTarget, setDeliveryTarget] = useState<HTMLDivElement | null>(null)

	useEffect(() => {
		dispatch(findDeliveryTarget({ type: 'navigator/contextButton', onFound: setDeliveryTarget }))
	}, [deliveryTargets, dispatch, findDeliveryTarget])

	if (!deliveryTarget) {
		return null
	}

	return createPortal(children, deliveryTarget)
}

export function NavigatorDeliveryTarget() {
	const { registerDeliveryTarget } = portalSlice.actions
	const dispatch = useDispatch()

	return (
		<Box
			component="div"
			sx={{ height: '100%' }}
			ref={(ref) => {
				const typedRef = ref as HTMLDivElement | null
				if (typedRef) {
					dispatch(registerDeliveryTarget({ type: 'navigator/contextButton', node: typedRef }))
				}
			}}
		></Box>
	)
}

export const { Summonable, SummoningPortal } = researchSummonable({
	family: 'navigator/contextButton',
})
