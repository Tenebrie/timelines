import { useDispatch, useSelector } from 'react-redux'

import { preferencesSlice } from '../../preferences/reducer'
import { getOutlinerPreferences } from '../../preferences/selectors'

export const useOutlinerTabs = () => {
	const { tabIndex } = useSelector(getOutlinerPreferences, (a, b) => a.tabIndex === b.tabIndex)

	const dispatch = useDispatch()
	const { setOutlinerTab } = preferencesSlice.actions

	const actorsVisible = tabIndex === 0 || tabIndex === 1
	const eventsVisible = tabIndex === 0 || tabIndex === 2
	const revokedVisible = tabIndex === 3

	const setCurrentTab = (tab: number) => {
		dispatch(setOutlinerTab(tab))
	}

	return {
		currentTab: tabIndex,
		setCurrentTab,
		actorsVisible,
		eventsVisible,
		revokedVisible,
	}
}
