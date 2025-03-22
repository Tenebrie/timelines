import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

interface Props {
	children: ReactNode
	family: string
}

function ErrorFallback({ error, family }: { error: Error; family: string }) {
	return (
		<Box
			sx={{
				p: 2,
				border: '1px solid',
				borderColor: 'error.main',
				borderRadius: 1,
				bgcolor: 'error.light',
			}}
		>
			<Typography variant="body2" color="error">
				Error in summonable {family}: {error.message}
			</Typography>
		</Box>
	)
}

export function SummonableErrorBoundary({ children, family }: Props) {
	return (
		<ErrorBoundary
			FallbackComponent={(props) => <ErrorFallback {...props} family={family} />}
			onError={(error, errorInfo) => {
				// Log the error to an error reporting service
				console.error('Summonable Error:', error, errorInfo)
			}}
		>
			{children}
		</ErrorBoundary>
	)
}
