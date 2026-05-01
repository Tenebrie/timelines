import { useListUserAssetsQuery } from '@api/assetApi'
import { useExportUserDataMutation, useImportUserDataMutation } from '@api/dataMigrationApi'
import { useGetStorageStatusQuery } from '@api/profileApi'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import ImportIcon from '@mui/icons-material/FileDownload'
import ExportIcon from '@mui/icons-material/FileUpload'
import AssetsIcon from '@mui/icons-material/Folder'
import QuotaIcon from '@mui/icons-material/Storage'
import PreviewIcon from '@mui/icons-material/Visibility'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useRef, useState } from 'react'

import { useModal } from '@/app/features/modals/ModalsSlice'
import { formatBytes } from '@/app/utils/formatBytes'
import { Button } from '@/ui-lib/components/Button/Button'
import { Header } from '@/ui-lib/components/Header/Header'
import { LoadingSelect } from '@/ui-lib/components/LoadingSelect/LoadingSelect'

export function StoragePage() {
	return (
		<Stack gap={3}>
			<Stack gap={2}>
				<Typography variant="h5" sx={{ fontFamily: 'Inter', fontWeight: 500 }}>
					Data
				</Typography>
				<Divider />
			</Stack>
			<Stack gap={6}>
				<StoragePageQuota />
				<StoragePageAssets />
				<StoragePageExport />
				<StoragePageImport />
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
			<Typography
				variant="h6"
				sx={{ display: 'flex', fontFamily: 'Inter', alignItems: 'center', gap: 1, fontSize: 18 }}
			>
				<QuotaIcon /> Storage Quota
			</Typography>
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
	const { data: assetsData } = useListUserAssetsQuery()
	const { open: openDeleteAssetModal } = useModal('deleteAssetModal')

	return (
		<Stack spacing={2}>
			<Typography
				variant="h6"
				sx={{ display: 'flex', fontFamily: 'Inter', alignItems: 'center', gap: 1, fontSize: 18 }}
			>
				<AssetsIcon /> Assets
			</Typography>
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

export function StoragePageExport() {
	const [exportUserData, { isLoading }] = useExportUserDataMutation()

	const handleExport = async () => {
		const result = await exportUserData().unwrap()
		const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `neverkin-export-${new Date().toISOString().slice(0, 10)}.json`
		a.click()
		URL.revokeObjectURL(url)
	}

	const handlePreview = async () => {
		const result = await exportUserData().unwrap()
		const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		window.open(url, '_blank')
	}

	return (
		<Stack spacing={2}>
			<Header variant="h2" icon={<ExportIcon />}>
				Export data
			</Header>
			<Typography variant="body2" color="text.secondary">
				Export your user data as a file to import it into your self-hosted Neverkin environment.
			</Typography>
			<LoadingSelect value="json" label="Export format">
				<MenuItem value="json">JSON</MenuItem>
			</LoadingSelect>
			<Stack direction="row" spacing={1}>
				<Button
					variant="contained"
					color="primary"
					startIcon={<ExportIcon />}
					onClick={handleExport}
					loading={isLoading}
					sx={{ minWidth: 110 }}
				>
					Export
				</Button>
				<Button
					variant="outlined"
					startIcon={<PreviewIcon />}
					onClick={handlePreview}
					loading={isLoading}
					sx={{ minWidth: 110 }}
				>
					Preview
				</Button>
			</Stack>
			<Typography variant="caption" color="text.secondary">
				Collecting all your data may take a few seconds.
			</Typography>
		</Stack>
	)
}

export function StoragePageImport() {
	const [importUserData, { isLoading }] = useImportUserDataMutation()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] ?? null
		setSelectedFile(file)
		setStatus('idle')
	}

	const handleImport = async () => {
		if (!selectedFile) return

		try {
			const text = await selectedFile.text()
			await importUserData({ body: { data: { data: text } } }).unwrap()
			setStatus('success')
			setSelectedFile(null)
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		} catch {
			setStatus('error')
		}
	}

	return (
		<Stack spacing={2}>
			<Header variant="h2" icon={<ImportIcon />}>
				Import data
			</Header>
			<Typography variant="body2" color="text.secondary">
				Import user data from a previously exported JSON file.
			</Typography>
			<Button
				variant="outlined"
				component="label"
				startIcon={<ImportIcon />}
				sx={{ alignSelf: 'flex-start' }}
			>
				{selectedFile ? selectedFile.name : 'Select JSON file'}
				<input
					ref={fileInputRef}
					type="file"
					accept="application/json,.json"
					hidden
					onChange={handleFileChange}
				/>
			</Button>
			<Stack direction="row" spacing={1} alignItems="center">
				<Button
					variant="contained"
					color="primary"
					startIcon={<ImportIcon />}
					onClick={handleImport}
					loading={isLoading}
					disabled={!selectedFile}
					sx={{ minWidth: 110 }}
				>
					Import
				</Button>
			</Stack>
			{status === 'success' && (
				<Typography variant="body2" color="success.main">
					Data imported successfully.
				</Typography>
			)}
			{status === 'error' && (
				<Typography variant="body2" color="error.main">
					Import failed. Please check the file and try again.
				</Typography>
			)}
			<Typography variant="caption" color="text.secondary">
				Warning: Importing data will merge it with your existing data.
			</Typography>
		</Stack>
	)
}
