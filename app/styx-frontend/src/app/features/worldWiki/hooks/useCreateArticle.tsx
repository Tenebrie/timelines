import { useCreateArticleMutation } from '@api/otherApi'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { getWorldIdState } from '../../worldTimeline/selectors'

export const useCreateArticle = () => {
	const worldId = useSelector(getWorldIdState)
	const [createArticle] = useCreateArticleMutation()

	const create = async ({ name }: { name: string }) => {
		const { response, error } = parseApiResponse(
			await createArticle({
				worldId,
				body: {
					name,
				},
			}),
		)
		if (error) {
			console.error(error)
			return
		}
		return response
	}

	return {
		createArticle: create,
	}
}
