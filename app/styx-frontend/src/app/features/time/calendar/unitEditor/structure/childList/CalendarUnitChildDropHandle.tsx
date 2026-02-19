import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useRef } from 'react'

import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { useDragDropStateWithRenders } from '@/app/features/dragDrop/hooks/useDragDropStateWithRenders'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

type Props = {
	parentUnitId: string
	position: number
	onReorder: (fromIndex: number, toIndex: number) => void
}

export function CalendarUnitChildDropHandle({ parentUnitId, position, onReorder }: Props) {
	const theme = useCustomTheme()
	const ref = useRef<HTMLDivElement>(null)
	const { isDragging } = useDragDropStateWithRenders()

	useDragDropReceiver({
		type: 'calendarUnitChild',
		receiverRef: ref,
		onDrop: ({ params }, event) => {
			event.markHandled()
			if (params.parentUnitId !== parentUnitId) {
				return
			}
			onReorder(params.index, position)
		},
	})

	return (
		<Stack
			ref={ref}
			sx={{
				width: '100%',
				height: '8px',
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
