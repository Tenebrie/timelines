import { useDispatch } from 'react-redux'

import { useEffectOnce } from '@/app/utils/useEffectOnce'

import { preferencesSlice } from '../PreferencesSlice'

export const useSavedPreferences = () => {
	const { loadFromLocalStorage } = preferencesSlice.actions
	const dispatch = useDispatch()

	useEffectOnce(() => {
		dispatch(loadFromLocalStorage())
	})
}
