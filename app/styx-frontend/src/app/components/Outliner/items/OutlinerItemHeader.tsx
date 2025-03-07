import Stack from '@mui/material/Stack'
import { memo } from 'react'
import { useSelector } from 'react-redux'

import { useOutlinerTabs } from '@/app/components/Outliner/hooks/useOutlinerTabs'
import { ContainedSpinner } from '@/app/features/skeleton/ContainedSpinner'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { OutlinerEmptySearch } from '../components/OutlinerEmptySearch'
import { OutlinerSearch } from '../OutlinerSearch'

export const OutlinerItemHeader = memo(OutlinerItemHeaderComponent)

export function OutlinerItemHeaderComponent() {
	const { search } = useSelector(getWorldState, (a, b) => a.search === b.search)
	const { currentTab, setCurrentTab } = useOutlinerTabs()

	return (
		<Stack>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ margin: '1px' }}>
				{/* <Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)}>
					<Tab label="All" />
					<Tab label="Actors" />
					<Tab label="Events" />
					<Tab label="Simplified" /> 
				</Tabs> */}
				<OutlinerSearch />
			</Stack>
			<ContainedSpinner visible={search.isLoading} />
			{search.query &&
				!search.isLoading &&
				search.results.actors.length === 0 &&
				search.results.events.length === 0 && <OutlinerEmptySearch />}
		</Stack>
	)
}
