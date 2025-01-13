import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useRouteError } from 'react-router-dom'

export const ErrorBoundary = () => {
	const error = useRouteError() as Error

	return (
		<Stack width="100vw" height="100vh" alignItems="center" justifyContent="center">
			<Paper
				sx={{
					padding: 4,
					width: '100%',
					height: '100%',
					maxWidth: '1200px',
					maxHeight: '1000px',
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
				}}
			>
				<Typography variant="h4">An error has occurred:</Typography>
				<TextField
					disabled
					multiline
					value={`${error.name}: ${error.message}\n\n${error.stack}`}
					rows={20}
					inputProps={{
						style: { fontFamily: 'monospace', fontSize: 14 },
					}}
					sx={{ background: 'lightgray' }}
				/>
			</Paper>
		</Stack>
	)
}
