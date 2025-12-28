import { useCheckAuthenticationQuery } from '@api/authApi'
import { useSelector } from 'react-redux'

import { getAuthState } from '../AuthSliceSelectors'
import { GuestDropdown } from './dropdowns/GuestDropdown'
import { SlowAuthDropdown } from './dropdowns/SlowAuthDropdown'
import { UserDropdown } from './dropdowns/UserDropdown'

export const SmallProfile = () => {
	const { isLoading } = useCheckAuthenticationQuery()
	const { user } = useSelector(getAuthState)

	if (isLoading) {
		return <SlowAuthDropdown />
	}

	if (!user) {
		return <GuestDropdown />
	}

	return <UserDropdown user={user} />
}
