import { useListUserAssetsQuery } from '@api/assetApi'
import {
	useExportUserDataMutation,
	useImportUserDataMutation,
	useValidateImportUserDataMutation,
} from '@api/dataMigrationApi'
import { useFileUpload } from '@api/hooks/fileUpload/useFileUpload'
import { useGetStorageStatusQuery } from '@api/profileApi'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/Delete'
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined'
import DownloadIcon from '@mui/icons-material/Download'
import ImportIcon from '@mui/icons-material/FileDownload'
import ExportIcon from '@mui/icons-material/FileUpload'
import AssetsIcon from '@mui/icons-material/Folder'
import QuotaIcon from '@mui/icons-material/Storage'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
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
import { parseApiResponse } from '@/app/utils/parseApiResponse'
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
				<StoragePageExport />
				<StoragePageImport />
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
	const [status, setStatus] = useState<'idle' | 'error'>('idle')

	const handleExport = async () => {
		const result = parseApiResponse(await exportUserData())
		if (result.error) {
			setStatus('error')
			return
		}
		const a = document.createElement('a')
		a.href = result.response.url
		a.download = `neverkin-export-${new Date().toISOString().slice(0, 10)}.json`
		a.click()
	}

	return (
		<Box
			sx={{
				border: 1,
				borderColor: 'divider',
				borderRadius: 1,
				p: 3,
			}}
		>
			<Stack spacing={2.5}>
				<Stack spacing={0.5}>
					<Header variant="h2" icon={<ExportIcon />}>
						Export data
					</Header>
					<Typography variant="body2" color="text.secondary">
						Export your user data as a file as a backup or to transfer between accounts or environments.
					</Typography>
				</Stack>
				<LoadingSelect value="json" label="Export format" fullWidth>
					<MenuItem value="json">JSON</MenuItem>
				</LoadingSelect>
				<Stack direction="row" spacing={1} alignItems="center">
					<Button
						variant="contained"
						color="primary"
						startIcon={<ExportIcon />}
						onClick={handleExport}
						loading={isLoading}
						sx={{ minWidth: 120 }}
					>
						Export
					</Button>
					<Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
						Collecting all your data may take a few seconds.
					</Typography>
				</Stack>
				{status === 'error' && (
					<Alert severity="error" variant="outlined">
						Export failed. Please try again later.
					</Alert>
				)}
				{status === 'idle' && (
					<Alert severity="info" variant="outlined" icon={false} sx={{ py: 1 }}>
						<AlertTitle sx={{ mb: 0.5, fontSize: 14 }}>Not included in export</AlertTitle>
						<Stack
							component="ul"
							sx={{
								m: 0,
								pl: 2.5,
								'& li': { fontSize: 13, color: 'text.secondary', lineHeight: 1.7 },
							}}
						>
							<li>Assets (images, other files)</li>
							<li>Personal user data (name, email, etc.)</li>
							<li>Collaborating users and invites</li>
						</Stack>
					</Alert>
				)}
			</Stack>
		</Box>
	)
}

export function StoragePageImport() {
	const [importUserData, { isLoading }] = useImportUserDataMutation()
	const [validateUserData, { isLoading: isValidating }] = useValidateImportUserDataMutation()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'validated' | 'validationError'>('idle')
	const [validationDone, setValidationDone] = useState(false)

	const { uploadFile } = useFileUpload()
	const [uploadedAsset, setUploadedAsset] = useState<{ id: string } | null>(null)

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] ?? null
		setSelectedFile(file)
		setStatus('idle')
		setValidationDone(false)
	}

	const handleImport = async () => {
		if (!uploadedAsset) {
			return
		}

		const result = parseApiResponse(await importUserData({ body: { assetId: uploadedAsset.id } }))
		if (result.error) {
			setStatus('error')
			return
		}
		setStatus('success')
		setSelectedFile(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const handleValidation = async () => {
		if (!selectedFile) {
			return
		}

		const asset = await uploadFile(selectedFile, 'DataMigrationImport')
		setUploadedAsset(asset)

		const result = parseApiResponse(await validateUserData({ body: { assetId: asset.id } }))
		if (result.error) {
			setStatus('validationError')
			return
		}
		setValidationDone(true)
		setStatus('validated')
	}

	const handleClearFile = () => {
		setSelectedFile(null)
		setStatus('idle')
		setValidationDone(false)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	return (
		<Box
			sx={{
				border: 1,
				borderColor: 'divider',
				borderRadius: 1,
				p: 3,
			}}
		>
			<Stack spacing={2.5}>
				<Stack spacing={0.5}>
					<Header variant="h2" icon={<ImportIcon />}>
						Import data
					</Header>
					<Typography variant="body2" color="text.secondary">
						Import user data from a previously exported JSON file.
					</Typography>
				</Stack>

				{!selectedFile && (
					<Button
						variant="outlined"
						component="label"
						startIcon={<ImportIcon />}
						sx={{ alignSelf: 'flex-start', minWidth: 180 }}
					>
						Select JSON file
						<input
							ref={fileInputRef}
							type="file"
							accept="application/json,.json"
							hidden
							onChange={handleFileChange}
						/>
					</Button>
				)}

				{selectedFile && (
					<Stack
						direction="row"
						alignItems="center"
						spacing={1.5}
						sx={{
							border: 1,
							borderColor: 'divider',
							borderRadius: 1,
							px: 2,
							py: 1,
							bgcolor: 'action.hover',
						}}
					>
						<DescriptionIcon sx={{ color: 'text.secondary' }} />
						<Stack sx={{ flex: 1, minWidth: 0 }}>
							<Typography variant="body2" noWrap title={selectedFile.name}>
								{selectedFile.name}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{formatBytes(selectedFile.size)}
								{validationDone ? ' · Validated' : ''}
							</Typography>
						</Stack>
						<IconButton size="small" onClick={handleClearFile} aria-label="Remove file">
							<ClearIcon fontSize="small" />
						</IconButton>
					</Stack>
				)}

				<Stack direction="row" spacing={1} alignItems="center">
					<Button
						variant="contained"
						color="secondary"
						onClick={handleValidation}
						loading={isValidating}
						disabled={!selectedFile || validationDone}
						startIcon={<ImportIcon />}
						sx={{ minWidth: 120 }}
					>
						Upload & Validate
					</Button>
					<Button
						variant="contained"
						color="primary"
						startIcon={<ImportIcon />}
						onClick={handleImport}
						loading={isLoading}
						disabled={!selectedFile || !validationDone}
						sx={{ minWidth: 120 }}
					>
						Import
					</Button>
				</Stack>

				{status === 'success' && (
					<Alert severity="success" variant="outlined">
						Data imported successfully.
					</Alert>
				)}
				{status === 'error' && (
					<Alert severity="error" variant="outlined">
						Import failed. Please check the file and try again.
					</Alert>
				)}
				{status === 'validated' && (
					<Alert severity="success" variant="outlined">
						Data validated successfully. You can now run the import.
					</Alert>
				)}
				{status === 'validationError' && (
					<Alert severity="error" variant="outlined">
						Validation failed. Please check the file and try again.
					</Alert>
				)}
			</Stack>
		</Box>
	)
}
