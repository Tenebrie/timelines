import { useDispatch } from 'react-redux'

import { useEffectOnce } from '../../utils/useEffectOnce'
import { preferencesSlice } from './reducer'

export const useSavedPreferences = () => {
	const { loadFromLocalStorage } = preferencesSlice.actions
	const dispatch = useDispatch()

	useEffectOnce(() => {
		dispatch(loadFromLocalStorage())
	})
}
