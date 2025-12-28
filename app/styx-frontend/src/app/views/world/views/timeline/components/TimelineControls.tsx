import KeyboardDoubleArrowLeft from '@mui/icons-material/KeyboardDoubleArrowLeft'
import KeyboardDoubleArrowRight from '@mui/icons-material/KeyboardDoubleArrowRight'
import ZoomIn from '@mui/icons-material/ZoomIn'
import ZoomOut from '@mui/icons-material/ZoomOut'
import Fab from '@mui/material/Fab'
import Stack from '@mui/material/Stack'
import { memo, useEffect, useRef, useState } from 'react'

import { useEventBusDispatch } from '@/app/features/eventBus'

export const TimelineControls = memo(TimelineControlsComponent)

function TimelineControlsComponent() {
	const requestZoom = useEventBusDispatch({ event: 'timeline/requestZoom' })
	const scrollTimelineLeft = useEventBusDispatch({ event: 'timeline/requestScrollLeft' })
	const scrollTimelineRight = useEventBusDispatch({ event: 'timeline/requestScrollRight' })

	const [hover, setHover] = useState(false)

	const ref = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const onHoverStart = () => {
			setHover(true)
		}

		const onHoverEnd = () => {
			setHover(false)
		}

		const currentRef = ref.current
		if (!currentRef) {
			return
		}

		currentRef.addEventListener('mouseenter', onHoverStart)
		currentRef.addEventListener('mouseleave', onHoverEnd)
		return () => {
			currentRef.removeEventListener('mouseenter', onHoverStart)
			currentRef.removeEventListener('mouseleave', onHoverEnd)
		}
	})

	return (
		<Stack
			sx={{
				position: 'absolute',
				bottom: 48,
				right: 0,
				paddingTop: 10,
				paddingLeft: 1,
				zIndex: 10,
			}}
			ref={ref}
		>
			<Fab
				color="primary"
				onClick={() => requestZoom({ direction: 'in' })}
				sx={{ marginBottom: 2, marginRight: 2 }}
			>
				<ZoomIn />
			</Fab>
			<Stack
				sx={{
					position: 'absolute',
					padding: 2,
					bottom: 0,
					right: 0,
					opacity: hover ? 1 : 0,
					transition: 'opacity 0.3s',
					gap: 1,
				}}
			>
				<Stack direction="row" gap={1}>
					<Fab color="primary" onClick={() => scrollTimelineLeft()}>
						<KeyboardDoubleArrowLeft />
					</Fab>
					<Fab color="primary" onClick={() => scrollTimelineRight()}>
						<KeyboardDoubleArrowRight />
					</Fab>
				</Stack>
				<Stack direction="row" gap={1}>
					<Fab color="primary" onClick={() => requestZoom({ direction: 'out' })}>
						<ZoomOut />
					</Fab>
					<Fab sx={{ visibility: 'hidden' }}></Fab>
				</Stack>
			</Stack>
		</Stack>
	)
}
