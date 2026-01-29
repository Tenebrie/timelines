import { useGetAnnouncementsQuery } from '@api/announcementListApi'
import { useSelector } from 'react-redux'

import { getAuthState } from '../../auth/AuthSliceSelectors'

export function useGetAnnouncements() {
	const { user } = useSelector(getAuthState)
	const data = useGetAnnouncementsQuery(undefined, {
		skip: !user,
	})
	return data
}
