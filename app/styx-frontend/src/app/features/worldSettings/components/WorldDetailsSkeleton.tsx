import Stack from '@mui/material/Stack'

import { LoadingSpinner } from '@/app/components/LoadingSpinner'

export const WorldDetailsSkeleton = () => {
	return (
		<Stack alignItems="center" justifyContent="center">
			<LoadingSpinner />
		</Stack>
	)
}
