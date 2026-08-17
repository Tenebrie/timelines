import { Actor, WorldEvent, WorldTag } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import { memo } from 'react'
import { useSelector } from 'react-redux'
import { Virtuoso } from 'react-virtuoso'

import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { useOutlinerTabs } from '@/app/components/Outliner/hooks/useOutlinerTabs'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

import { CreateEntityButton } from './components/CreateEntityButton'
import { OutlinerEmptyState } from './components/OutlinerEmptyState'
import { useVisibleActors } from './hooks/useVisibleActors'
import { useVisibleEvents } from './hooks/useVisibleEvents'
import { useVisibleTags } from './hooks/useVisibleTags'
import { OutlinerItemEvent } from './items/OutlinerItemEvent'
import { OutlinerItemHeader } from './items/OutlinerItemHeader'
import { OutlinerItemTag } from './items/OutlinerItemTag'

export const OutlinerContent = memo(OutlinerContentComponent)

export function OutlinerContentComponent() {
	const { selectedTime, search } = useSelector(
		getWorldState,
		(a, b) => a.selectedTime === b.selectedTime && a.search === b.search,
	)
	const eventsVisible = useCheckRouteMatch('/world/$worldId/timeline')
	const actorsVisible = useCheckRouteMatch('/world/$worldId/mindmap')

	const allVisibleActors = useVisibleActors()

	const { revokedVisible } = useOutlinerTabs()

	const allVisibleEvents = useVisibleEvents({
		timestamp: selectedTime,
		includeInactive: revokedVisible,
	})
	const allVisibleTags = useVisibleTags()

	const totalCount = (() => {
		let total = 1
		if (actorsVisible) {
			total += allVisibleActors.length
		}
		if (eventsVisible) {
			total += allVisibleEvents.length
		}
		total += allVisibleTags.length
		return total
	})()
	const scrollerVisible = totalCount > 1 || !!search.query

	type ResolvedRow =
		| { kind: 'actor'; actor: Actor }
		| { kind: 'event'; event: WorldEvent }
		| { kind: 'tag'; tag: WorldTag }
		| { kind: 'empty' }

	const resolveRow = (rawIndex: number): ResolvedRow => {
		let offset = rawIndex - 1

		if (actorsVisible) {
			if (offset < allVisibleActors.length) {
				return { kind: 'actor', actor: allVisibleActors[offset] }
			}
			offset -= allVisibleActors.length
		}

		if (eventsVisible) {
			if (offset < allVisibleEvents.length) {
				return { kind: 'event', event: allVisibleEvents[offset] }
			}
			offset -= allVisibleEvents.length
		}

		const tag = allVisibleTags[offset]
		return tag ? { kind: 'tag', tag } : { kind: 'empty' }
	}

	return (
		<OutlinedContainer
			label="Outliner"
			fullHeight
			style={{ pointerEvents: 'auto' }}
			secondaryLabel={<CreateEntityButton />}
		>
			<Box
				sx={{
					width: '100%',
					height: '100%',
					overflowY: 'auto',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					'& > *': {
						flexGrow: 0,
						flexShrink: 0,
					},
					'& > [data-virtuoso-scroller]': {
						...useBrowserSpecificScrollbars(),
					},
				}}
			>
				<Virtuoso
					style={{ height: '100%', ...scrollbars }}
					totalCount={Math.max(2, totalCount)}
					itemContent={(rawIndex) => {
						if (!scrollerVisible && rawIndex === 1) {
							return <OutlinerEmptyState />
						}

						if (rawIndex === 0) {
							return <OutlinerItemHeader />
						}

						const row = resolveRow(rawIndex)
						switch (row.kind) {
							case 'event':
								return <OutlinerItemEvent event={row.event} />
							case 'tag':
								return <OutlinerItemTag tag={row.tag} />
							case 'empty':
								return <div>&nbsp;</div>
						}
					}}
				/>
			</Box>
		</OutlinedContainer>
	)
}
