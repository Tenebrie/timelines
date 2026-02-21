import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useRef } from 'react'

import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { useDragDropStateWithRenders } from '@/app/features/dragDrop/hooks/useDragDropStateWithRenders'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

import { useMoveCalendarUnit } from '../../hooks/useMoveCalendarUnit'

type Props = {
	position: number
	marginLeft?: string | number
}

export function CalendarUnitListDropHandle({ position, marginLeft }: Props) {
	const theme = useCustomTheme()
	const [moveCalendarUnit] = useMoveCalendarUnit()

	const ref = useRef<HTMLDivElement>(null)

	const { isDragging } = useDragDropStateWithRenders()

	useDragDropReceiver({
		type: 'calendarUnit',
		receiverRef: ref,
		onDrop: ({ params }, event) => {
			event.markHandled()
			moveCalendarUnit({
				id: params.unit.id,
				position: position - 1,
			})
		},
	})

	return (
		<Stack
			ref={ref}
			data-testid={`CalendarUnitListDropHandle/${position}`}
			sx={{
				width: 'calc(100% - 16px)',
				height: '8px',
				padding: '0 8px',
				zIndex: 2,
				marginLeft,
				alignItems: 'center',
				justifyContent: 'center',
				...(isDragging && {
					'& > *': { backgroundColor: theme.custom.palette.background.softer },
					'&:hover > *': { backgroundColor: theme.custom.palette.background.soft },
				}),
			}}
		>
			<Box sx={{ width: '100%', height: '4px', transition: 'background-color 0.3s' }}></Box>
		</Stack>
	)
}
