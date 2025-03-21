import { useListUserAssetsQuery } from '@api/assetApi'
import { useGetStorageStatusQuery } from '@api/profileApi'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useSelector } from 'react-redux'

import { User } from '@/app/features/auth/AuthSlice'
import { getAuthState } from '@/app/features/auth/AuthSliceSelectors'
import { formatBytes } from '@/app/utils/formatBytes'

export function StoragePage() {
	const { user } = useSelector(getAuthState)

	if (!user) {
		return null
	}

	return <InternalComponent user={user} />
}

type Props = {
	user: User
}

function InternalComponent({ user }: Props) {
	const { data: quotaData } = useGetStorageStatusQuery()
	const { data: assetsData } = useListUserAssetsQuery()

	const usedQuota = quotaData?.quota.used ?? 0
	const totalQuota = quotaData?.quota.total ?? 0
	const quotaPercentage = totalQuota > 0 ? (usedQuota / totalQuota) * 100 : 0

	return (
		<>
			<Typography variant="h5" sx={{ mb: 3 }}>
				Storage
			</Typography>

			<Stack spacing={4}>
				<Stack spacing={1}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Typography variant="body2" color="text.secondary">
							Used: {formatBytes(usedQuota)}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Total: {formatBytes(totalQuota)}
						</Typography>
					</Stack>
					<LinearProgress
						variant="determinate"
						value={quotaPercentage}
						sx={{
							height: 8,
							borderRadius: 4,
							'& .MuiLinearProgress-bar': {
								borderRadius: 4,
							},
						}}
					/>
				</Stack>

				<Stack spacing={2}>
					<Typography variant="h6">Assets</Typography>
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>Name</TableCell>
									<TableCell>Type</TableCell>
									<TableCell>Size</TableCell>
									<TableCell>Created</TableCell>
									<TableCell>Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{assetsData?.assets.map((asset) => (
									<TableRow key={asset.id}>
										<TableCell>
											{asset.originalFileName}
											{asset.originalFileExtension ? `.${asset.originalFileExtension}` : ''}
										</TableCell>
										<TableCell>{asset.contentType}</TableCell>
										<TableCell>{formatBytes(asset.size)}</TableCell>
										<TableCell>{new Date(asset.createdAt).toLocaleDateString()}</TableCell>
										<TableCell>
											<Stack direction="row">
												<IconButton size="small">
													<DownloadIcon
														sx={{ cursor: 'pointer', color: 'primary.main' }}
														onClick={() => {
															// TODO: Implement download
														}}
													/>
												</IconButton>
												<IconButton size="small">
													<DeleteIcon
														sx={{ cursor: 'pointer', color: 'error.main' }}
														onClick={() => {
															// TODO: Implement delete
														}}
													/>
												</IconButton>
											</Stack>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Stack>
			</Stack>
		</>
	)
}
