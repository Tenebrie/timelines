import { useSelector } from 'react-redux'

import { getAuthState } from '../AuthSliceSelectors'
import { GuestDropdown } from './dropdowns/GuestDropdown'
import { UserDropdown } from './dropdowns/UserDropdown'

export const SmallProfile = () => {
	const { user } = useSelector(getAuthState)

	if (!user) {
		return <GuestDropdown />
	}

	return <UserDropdown user={user} />
}
