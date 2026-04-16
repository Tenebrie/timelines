import { FeatureFlag } from '@api/types/otherTypes'
import { useSelector } from 'react-redux'

import { getAuthState } from '../AuthSliceSelectors'

export function useFeatureFlag(flag: FeatureFlag) {
	const { user } = useSelector(getAuthState, (a, b) => a.user === b.user)
	if (!user) {
		return false
	}

	return user.featureFlags.includes(flag)
}
