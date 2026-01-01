import { useListUserAssetsQuery } from '@api/assetApi'
import { useGetStorageStatusQuery } from '@api/profileApi'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import { useModal } from '@/app/features/modals/ModalsSlice'
import { formatBytes } from '@/app/utils/formatBytes'

export function StoragePage() {
	return (
		<Stack gap={2}>
			<Typography variant="h5">Storage</Typography>
			<Divider />
			<Stack spacing={4}>
				<StoragePageQuota />
				<StoragePageAssets />
			</Stack>
		</Stack>
	)
}

export function StoragePageQuota() {
	const { data: quotaData, isLoading } = useGetStorageStatusQuery()

	const usedQuota = quotaData?.quota.used ?? 0
	const totalQuota = quotaData?.quota.total ?? 0
	const quotaPercentage = totalQuota > 0 ? (usedQuota / totalQuota) * 100 : 0

	return (
		<Stack spacing={2}>
			<Typography variant="h6">Quota</Typography>
			{isLoading && (
				<Stack spacing={1}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Skeleton variant="text" width={120} height={20} />
						<Skeleton variant="text" width={120} height={20} />
					</Stack>
					<Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4 }} />
				</Stack>
			)}
			{!isLoading && (
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
			)}
		</Stack>
	)
}

export function StoragePageAssets() {
	const { data: assetsData, isLoading } = useListUserAssetsQuery()
	const { open: openDeleteAssetModal } = useModal('deleteAssetModal')

	return (
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
						{isLoading && <StoragePageAssetsSkeleton />}
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
									<Stack direction="row" spacing={1}>
										<IconButton size="small" sx={{ width: 32, height: 32 }}>
											<DownloadIcon
												sx={{ cursor: 'pointer', color: 'primary.main' }}
												onClick={() => {
													// TODO: Implement download
												}}
											/>
										</IconButton>
										<IconButton
											size="small"
											sx={{ width: 32, height: 32 }}
											onClick={() => {
												openDeleteAssetModal({
													assetId: asset.id,
													assetName: `${asset.originalFileName}${asset.originalFileExtension ? `.${asset.originalFileExtension}` : ''}`,
												})
											}}
										>
											<DeleteIcon sx={{ cursor: 'pointer', color: 'error.main' }} />
										</IconButton>
									</Stack>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	)
}

function StoragePageAssetsSkeleton() {
	return (
		<>
			{Array(6)
				.fill(0)
				.map((_, index) => (
					<TableRow key={index}>
						<TableCell>
							<Skeleton variant="text" width={200} height={20} />
						</TableCell>
						<TableCell>
							<Skeleton variant="text" width={100} height={20} />
						</TableCell>
						<TableCell>
							<Skeleton variant="text" width={80} height={20} />
						</TableCell>
						<TableCell>
							<Skeleton variant="text" width={100} height={20} />
						</TableCell>
						<TableCell>
							<Stack direction="row" spacing={1}>
								<Skeleton variant="circular" width={32} height={32} />
								<Skeleton variant="circular" width={32} height={32} />
							</Stack>
						</TableCell>
					</TableRow>
				))}
		</>
	)
}
