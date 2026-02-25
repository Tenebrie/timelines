import { useGetCalendarPreviewQuery } from '@api/calendarApi'
import { CalendarDraftPresentation } from '@api/types/calendarTypes'
import { WorldCalendar } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useMemo, useRef, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Provider, useSelector } from 'react-redux'

import { EventBusProvider } from '@/app/features/eventBus'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { ScaleLevel } from '@/app/schema/ScaleLevel'
import { generateStore } from '@/app/store'
import { ingestCalendar } from '@/app/utils/ingestEntity'
import { TimelineAnchor } from '@/app/views/world/views/timeline/anchor/TimelineAnchor'
import { timelineInitialState } from '@/app/views/world/views/timeline/TimelineSlice'
import { worldInitialState } from '@/app/views/world/WorldSlice'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'
import { PreviewScrollHandler } from './PreviewScrollHandler'

type Props = {
	presentation: CalendarDraftPresentation
}

export function CalendarPresentationPreview({ presentation }: Props) {
	const { calendar: calendarDraft } = useSelector(getCalendarEditorState, (a, b) => a.calendar === b.calendar)
	const theme = useCustomTheme()

	const { data: previewData } = useGetCalendarPreviewQuery(
		{ calendarId: calendarDraft?.id ?? '' },
		{ skip: !calendarDraft },
	)

	const worldCalendar = useMemo<WorldCalendar | null>(() => {
		if (!previewData) {
			return null
		}
		return ingestCalendar(previewData)
	}, [previewData])

	const presentationIndex = useMemo(() => {
		if (!worldCalendar) {
			return -1
		}
		return worldCalendar.presentations.findIndex((p) => p.id === presentation.id)
	}, [worldCalendar, presentation.id])

	const scaleLevel = (presentationIndex - 1) as ScaleLevel

	const previewStore = useMemo(() => {
		if (!worldCalendar || presentationIndex < 0) {
			return null
		}
		return generateStore({
			preloadedState: {
				world: {
					...worldInitialState,
					calendars: [worldCalendar],
				},
				timeline: {
					...timelineInitialState,
					scaleLevel,
				},
			},
		})
	}, [worldCalendar, presentationIndex, scaleLevel])

	const [containerWidth, setContainerWidth] = useState(0)
	const observerRef = useRef<ResizeObserver | null>(null)

	const containerRef = useCallback((el: HTMLDivElement | null) => {
		if (observerRef.current) {
			observerRef.current.disconnect()
			observerRef.current = null
		}
		if (!el) {
			return
		}

		setContainerWidth(el.clientWidth)
		const observer = new ResizeObserver((entries) => {
			const entry = entries[0]
			if (entry) {
				setContainerWidth(entry.contentRect.width)
			}
		})
		observer.observe(el)
		observerRef.current = observer
	}, [])

	return (
		<Stack sx={{ mt: 2 }} gap={1}>
			<Divider />
			<Stack sx={{ opacity: 0.5 }}>
				<Typography variant="subtitle2">Preview</Typography>
			</Stack>
			<Box ref={containerRef} sx={{ position: 'relative', height: 64, overflow: 'hidden' }}>
				<ErrorBoundary fallbackRender={() => <div>Error loading preview</div>}>
					{previewStore && containerWidth > 0 && (
						<Provider store={previewStore}>
							<EventBusProvider>
								<PreviewScrollHandler containerWidth={containerWidth} />
								<TimelineAnchor containerWidth={containerWidth} />
							</EventBusProvider>
						</Provider>
					)}
				</ErrorBoundary>
				{/* Skeleton */}
				{!previewStore && (
					<Box
						ref={containerRef}
						sx={{
							position: 'absolute',
							width: '100%',
							height: '64px',
							background: theme.custom.palette.background.timelineHeader,
						}}
					>
						<Divider sx={{ width: '100%', position: 'absolute', bottom: '64px' }} />
						<Paper
							sx={{
								position: 'absolute',
								bottom: 0,
								left: 0,
								right: 0,
								height: '32px',
								borderRadius: 0,
							}}
						/>
					</Box>
				)}
			</Box>
		</Stack>
	)
}
