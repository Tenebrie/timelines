import { Stack } from '@mui/material'

import { LoadingSpinner } from '../../../../../components/LoadingSpinner'

export const WorldDetailsSkeleton = () => {
	return (
		<Stack alignItems="center" justifyContent="center">
			<LoadingSpinner />
		</Stack>
	)
}
