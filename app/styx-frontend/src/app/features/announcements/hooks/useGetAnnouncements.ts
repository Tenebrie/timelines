import { useSelector } from 'react-redux'

import { useGetAnnouncementsQuery } from '@/api/announcementListApi'

import { getAuthState } from '../../auth/AuthSliceSelectors'

export function useGetAnnouncements() {
	const { user } = useSelector(getAuthState)
	const data = useGetAnnouncementsQuery(undefined, {
		skip: !user,
	})
	return data
}
