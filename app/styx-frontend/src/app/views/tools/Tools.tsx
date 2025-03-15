import Input from '@mui/material/Input'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { RequestImageConversionApiArg, useGetSupportedImageFormatsQuery } from '@/api/otherApi'
import { FilePickerButton } from '@/app/components/FilePickerButton'
import { FormErrorBanner } from '@/app/components/FormErrorBanner'
import { useErrorState } from '@/app/utils/useErrorState'

import { useFileUpload } from './useFileUpload'
import { useGetPresignedDownloadUrl } from './useGetPresignedDownloadUrl'
import { useRequestImageConversion } from './useRequestImageConversion'

type ImageFormat = RequestImageConversionApiArg['body']['format']

export function Tools() {
	const [lastConverted, setLastConverted] = useState<{
		name: string
		href: string
	} | null>(null)

	const [quality, setQuality] = useState<number>(80)
	const [width, setWidth] = useState<string>('')
	const [height, setHeight] = useState<string>('')
	const [format, setFormat] = useState<ImageFormat>('webp')

	const { data: formatData } = useGetSupportedImageFormatsQuery()
	const { uploadFile } = useFileUpload()
	const [requestImageConversion] = useRequestImageConversion()
	const [getPresignedDownloadUrl] = useGetPresignedDownloadUrl()

	const errorState = useErrorState<{ conversionError: string }>()
	const { raiseError, clearError } = errorState

	const onFilesSelected = async (fileList: FileList) => {
		clearError()
		const file = fileList[0]
		const reader = new FileReader()

		reader.onload = async (event) => {
			if (!event.target) {
				return
			}
			const base64File = event.target.result
			if (!base64File || typeof base64File !== 'string') {
				return
			}

			try {
				const asset = await uploadFile(file, 'Image')
				const convertedAsset = await requestImageConversion({
					assetId: asset.id,
					format,
					quality: quality,
					width: width ? Number(width) : undefined,
					height: height ? Number(height) : undefined,
				})
				const downloadUrl = await getPresignedDownloadUrl(convertedAsset.id)
				setLastConverted({
					name: `${convertedAsset.originalFileName}.${format}`,
					href: downloadUrl.url,
				})
			} catch {
				raiseError('conversionError', 'Failed to upload file')
			}
		}

		reader.readAsDataURL(file)
	}

	return (
		<Paper elevation={2} sx={{ marginTop: 4, padding: 4, minWidth: 500 }}>
			<Stack direction="column" gap={2} width={1}>
				<Typography variant="h5">Image converter</Typography>
				<Stack direction="column" gap={2} width={1}>
					<Stack direction="row" alignItems="center" gap={1} justifyContent="space-between">
						<Typography>Quality (Optional):</Typography>
						<Input
							type="number"
							value={quality}
							onChange={(event) => setQuality(Number(event.target.value))}
						/>
					</Stack>
					<Stack direction="row" alignItems="center" gap={1} justifyContent="space-between">
						<Typography>Width (Optional):</Typography>
						<Input type="number" value={width} onChange={(event) => setWidth(event.target.value)} />
					</Stack>
					<Stack direction="row" alignItems="center" gap={1} justifyContent="space-between">
						<Typography>Height (Optional):</Typography>
						<Input type="number" value={height} onChange={(event) => setHeight(event.target.value)} />
					</Stack>
					<Stack direction="row" alignItems="center" gap={1} justifyContent="space-between">
						<Typography>Format:</Typography>
						<Select
							value={format}
							onChange={(event) => setFormat(event.target.value as ImageFormat)}
							sx={{ minWidth: 120 }}
						>
							{formatData?.formats.map((format) => (
								<MenuItem key={format} value={format}>
									{format}
								</MenuItem>
							))}
						</Select>
					</Stack>
					<FilePickerButton onSelect={onFilesSelected} />
				</Stack>
				{lastConverted && (
					<a download={lastConverted.name} href={lastConverted.href}>
						Download {lastConverted.name}
					</a>
				)}
				<FormErrorBanner errorState={errorState} />
			</Stack>
		</Paper>
	)
}
