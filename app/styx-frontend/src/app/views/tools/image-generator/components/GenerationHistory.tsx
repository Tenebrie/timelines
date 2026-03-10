import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { useDeleteAssetMutation } from '@/api/assetApi'
import { useGetImageGenerationHistoryQuery } from '@/api/imageGenerationApi'
import { Pagination } from '@/app/views/admin/components/Pagination'

import { GenerationHistoryItem } from './GenerationHistoryItem'

const PAGE_SIZE = 10

export function GenerationHistory() {
	const [page, setPage] = useState(0)
	const { data, isLoading } = useGetImageGenerationHistoryQuery({ page, size: PAGE_SIZE })
	const [deleteAsset] = useDeleteAssetMutation()

	const handleDelete = (assetId: string) => {
		deleteAsset({ assetId })
	}

	if (isLoading) {
		return <CircularProgress />
	}

	if (!data?.assets || data.assets.length === 0) {
		return (
			<Typography variant="body2" color="text.secondary">
				No generated images yet.
			</Typography>
		)
	}

	return (
		<Stack spacing={2}>
			<Typography variant="h6">Generated Images</Typography>
			{data.pageCount > 1 && <Pagination initialPage={page} pageCount={data.pageCount} onChange={setPage} />}
			<Stack spacing={1}>
				{data.assets.map((asset) => (
					<GenerationHistoryItem key={asset.id} asset={asset} onDelete={() => handleDelete(asset.id)} />
				))}
			</Stack>
		</Stack>
	)
}
