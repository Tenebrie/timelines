import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DownloadIcon from '@mui/icons-material/Download'
import ErrorIcon from '@mui/icons-material/Error'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useRef, useState } from 'react'

import { useGetAssetQuery } from '@/api/assetApi'
import { ConfirmPopoverButton } from '@/ui-lib/components/PopoverButton/ConfirmPopoverButton'

type GenerationAsset = {
	id: string
	status: string
	createdAt: string
	originalFileName: string
	originalFileExtension: string
	contentDescription?: string | null
	imageWidth?: number | null
	imageHeight?: number | null
}

type Props = {
	asset: GenerationAsset
	onDelete: () => void
}

export function GenerationHistoryItem({ asset, onDelete }: Props) {
	// Only fetch presigned URL for finalized assets
	const { data: assetData } = useGetAssetQuery({ assetId: asset.id }, { skip: asset.status !== 'Finalized' })

	const isPending = asset.status === 'Pending'
	const isFailed = asset.status === 'Failed'
	const isFinalized = asset.status === 'Finalized'

	const downloadUrl = assetData?.url

	const [copied, setCopied] = useState(false)
	const [imageLoaded, setImageLoaded] = useState(false)
	const [hoverAnchor, setHoverAnchor] = useState<HTMLElement | null>(null)
	const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

	const handleCopyPrompt = () => {
		if (asset.contentDescription) {
			navigator.clipboard.writeText(asset.contentDescription)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		}
	}

	const handleThumbnailEnter = (e: React.MouseEvent<HTMLElement>) => {
		const target = e.currentTarget
		hoverTimeout.current = setTimeout(() => setHoverAnchor(target), 500)
	}

	const handleThumbnailLeave = () => {
		if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
		setHoverAnchor(null)
	}

	return (
		<Paper variant="outlined" sx={{ p: 2 }}>
			<Stack direction="row" spacing={2} alignItems="center">
				{/* Status icon */}
				<Box sx={{ width: 24, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
					{isPending && <CircularProgress size={24} />}
					{isFinalized && <CheckCircleIcon color="success" />}
					{isFailed && <ErrorIcon color="error" />}
				</Box>

				{/* Thumbnail */}
				{(isPending || (isFinalized && !imageLoaded)) && (
					<Box
						sx={{
							width: '60px',
							height: '60px',
							boxSizing: 'border-box',
							borderRadius: 1,
							flexShrink: 0,
							border: '1px dashed',
							borderColor: 'divider',
						}}
					/>
				)}
				{isFinalized && downloadUrl && (
					<>
						<Box
							component="img"
							src={downloadUrl}
							alt={asset.contentDescription ?? 'Generated image'}
							onMouseEnter={handleThumbnailEnter}
							onMouseLeave={handleThumbnailLeave}
							onLoad={() => setImageLoaded(true)}
							sx={{
								width: '60px',
								height: '60px',
								objectFit: 'cover',
								borderRadius: 1,
								flexShrink: 0,
								...(!imageLoaded && { position: 'absolute', visibility: 'hidden' }),
							}}
						/>
						<Popover
							open={!!hoverAnchor}
							anchorEl={hoverAnchor}
							onClose={handleThumbnailLeave}
							anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
							transformOrigin={{ vertical: 'center', horizontal: 'left' }}
							sx={{ pointerEvents: 'none' }}
							disableRestoreFocus
						>
							<Box
								component="img"
								src={downloadUrl}
								alt={asset.contentDescription ?? 'Generated image'}
								sx={{ maxWidth: 512, maxHeight: 512, display: 'block' }}
							/>
						</Popover>
					</>
				)}

				<Stack sx={{ flex: 1, minWidth: 0 }}>
					<Tooltip title={copied ? 'Copied!' : 'Click to copy prompt'} enterDelay={500} arrow>
						<Stack
							sx={{ flex: 1, minWidth: 0, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
							onClick={handleCopyPrompt}
						>
							<Typography variant="body2" noWrap>
								{asset.contentDescription ?? 'No prompt'}
							</Typography>
						</Stack>
					</Tooltip>
					<Typography variant="caption" color="text.secondary">
						{new Date(asset.createdAt).toLocaleString()}
						{asset.imageWidth && asset.imageHeight && ` · ${asset.imageWidth}×${asset.imageHeight}`}
					</Typography>
				</Stack>

				{/* Action buttons */}
				<Stack direction="row" alignItems="center">
					{isFinalized && downloadUrl && (
						<Tooltip title="Download image" disableInteractive enterDelay={500}>
							<IconButton
								component="a"
								href={downloadUrl}
								download={`${asset.originalFileName}.${asset.originalFileExtension}`}
								size="small"
								sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
							>
								<DownloadIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					)}
					<ConfirmPopoverButton
						type="delete"
						tooltip="Delete image"
						prompt="Are you sure you want to delete this generated image? This action cannot be undone."
						onConfirm={onDelete}
					/>
				</Stack>
			</Stack>
		</Paper>
	)
}
