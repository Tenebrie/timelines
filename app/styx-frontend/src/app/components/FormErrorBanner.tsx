import { Close } from '@mui/icons-material'
import { Alert, Collapse, IconButton } from '@mui/material'
import { TransitionGroup } from 'react-transition-group'

type Props = {
	marginBottom?: number
	errorState: {
		clearError: () => void
		error: {
			data: any
		} | null
	}
}

export const FormErrorBanner = ({ errorState, marginBottom }: Props) => {
	const { error, clearError } = errorState

	return (
		<TransitionGroup style={{ marginBottom: -(marginBottom ?? 16) }}>
			{error && (
				<Collapse>
					<Alert
						style={{ marginBottom: marginBottom ?? 16 }}
						severity="error"
						action={
							<IconButton size="small" onClick={clearError}>
								<Close fontSize="small" />
							</IconButton>
						}
					>
						{error.data}
					</Alert>
				</Collapse>
			)}
		</TransitionGroup>
	)
}
