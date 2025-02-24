import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { memo } from 'react'
import { useSelector } from 'react-redux'

import { ContainedSpinner } from '@/app/components/ContainedSpinner'
import { getWorldState } from '@/app/features/world/selectors'
import { useOutlinerTabs } from '@/app/features/worldTimeline/hooks/useOutlinerTabs'

import { SearchEmptyState } from '../OutlinerEmptyState/SearchEmptyState'
import { OutlinerSearch } from '../OutlinerSearch'

export const WorldStateHeader = memo(WorldStateHeaderComponent)

export function WorldStateHeaderComponent() {
	const { search } = useSelector(getWorldState, (a, b) => a.search === b.search)
	const { currentTab, setCurrentTab } = useOutlinerTabs()

	return (
		<Stack>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ margin: '1px' }}>
				<Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)}>
					<Tab label="All" />
					<Tab label="Actors" />
					<Tab label="Events" />
					{/* <Tab label="Simplified" /> */}
				</Tabs>
				<OutlinerSearch />
			</Stack>
			<ContainedSpinner visible={search.isLoading} />
			{search.query &&
				!search.isLoading &&
				search.results.actors.length === 0 &&
				search.results.events.length === 0 && <SearchEmptyState />}
		</Stack>
	)
}
