import { useSelector } from 'react-redux'

import { FeatureFlag } from '@/api/types/otherTypes'

import { getAuthState } from '../AuthSliceSelectors'

export function useFeatureFlag(flag: FeatureFlag) {
	const { user } = useSelector(getAuthState, (a, b) => a.user === b.user)
	if (!user) {
		return false
	}

	return user.featureFlags.includes(flag)
}
