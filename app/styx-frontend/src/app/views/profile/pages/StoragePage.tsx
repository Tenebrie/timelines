import { useListUserAssetsQuery } from '@api/assetApi'
import { useGetStorageStatusQuery } from '@api/profileApi'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import Divider from '@mui/material/Divider'
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

import { formatBytes } from '@/app/utils/formatBytes'

export function StoragePage() {
	const { data: quotaData } = useGetStorageStatusQuery()
	const { data: assetsData } = useListUserAssetsQuery()

	const usedQuota = quotaData?.quota.used ?? 0
	const totalQuota = quotaData?.quota.total ?? 0
	const quotaPercentage = totalQuota > 0 ? (usedQuota / totalQuota) * 100 : 0

	return (
		<Stack gap={2}>
			<Typography variant="h5">Storage</Typography>
			<Divider />

			<Stack spacing={4}>
				<Stack spacing={2}>
					<Typography variant="h6">Quota</Typography>
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
												<IconButton size="small" disabled>
													<DownloadIcon
														sx={{ cursor: 'pointer', color: 'primary.main' }}
														onClick={() => {
															// TODO: Implement download
														}}
													/>
												</IconButton>
												<IconButton size="small" disabled>
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
		</Stack>
	)
}
