import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Divider from '@mui/material/Divider'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import QRCode from 'qrcode'
import { useCallback, useEffect, useRef, useState } from 'react'

const errorLevels = ['L', 'M', 'Q', 'H'] as const
type ErrorCorrectionLevel = (typeof errorLevels)[number]
const errorLevelLabels: Record<ErrorCorrectionLevel, string> = {
	L: 'Low (7%)',
	M: 'Medium (15%)',
	Q: 'Quartile (25%)',
	H: 'High (30%)',
}

export function QrCodeGenerator() {
	const [text, setText] = useState(window.location.href)
	const [size, setSize] = useState(300)
	const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('M')
	const previewCanvasRef = useRef<HTMLCanvasElement>(null)
	const downloadCanvasRef = useRef<HTMLCanvasElement>(null)
	const [svgString, setSvgString] = useState('')

	const debouncedText = useDebounce(text, 300)

	useEffect(() => {
		if (!debouncedText) {
			const canvas = previewCanvasRef.current
			const downloadCanvas = downloadCanvasRef.current
			if (canvas) {
				const ctx = canvas.getContext('2d')
				ctx?.clearRect(0, 0, canvas.width, canvas.height)
			}
			if (downloadCanvas) {
				const ctx = downloadCanvas.getContext('2d')
				ctx?.clearRect(0, 0, downloadCanvas.width, downloadCanvas.height)
			}
			setSvgString('')
			return
		}

		const opts = {
			width: size,
			margin: 2,
			errorCorrectionLevel: errorLevel,
		}

		const canvasOpts = {
			...opts,
			width: 384,
		}

		QRCode.toCanvas(previewCanvasRef.current!, debouncedText, canvasOpts).catch(console.error)
		QRCode.toCanvas(downloadCanvasRef.current!, debouncedText, opts)
			.catch(console.error)
			.then(() => {
				downloadCanvasRef.current!.style.width = '100%'
				downloadCanvasRef.current!.style.height = '100%'
			})
		QRCode.toString(debouncedText, { ...opts, type: 'svg' })
			.then(setSvgString)
			.catch(console.error)
	}, [debouncedText, size, errorLevel])

	const downloadPng = useCallback(() => {
		const canvas = downloadCanvasRef.current
		if (!canvas) {
			return
		}
		const link = document.createElement('a')
		link.download = 'qrcode.png'
		link.href = canvas.toDataURL('image/png')
		link.click()
	}, [])

	const downloadSvg = useCallback(() => {
		if (!svgString) {
			return
		}
		const blob = new Blob([svgString], { type: 'image/svg+xml' })
		const link = document.createElement('a')
		link.download = 'qrcode.svg'
		link.href = URL.createObjectURL(blob)
		link.click()
		URL.revokeObjectURL(link.href)
	}, [svgString])

	const hasContent = Boolean(debouncedText)

	return (
		<Stack spacing={3}>
			<Typography variant="h5" component="h1">
				QR Code Generator
			</Typography>

			<TextField
				label="Text or URL"
				placeholder="https://example.com"
				multiline
				minRows={2}
				maxRows={4}
				value={text}
				onChange={(e) => setText(e.target.value)}
				fullWidth
			/>

			<Stack spacing={1}>
				<Typography variant="body2" color="text.secondary">
					Error correction
				</Typography>
				<ButtonGroup size="small">
					{errorLevels.map((level) => (
						<Button
							key={level}
							variant={errorLevel === level ? 'contained' : 'outlined'}
							onClick={() => setErrorLevel(level)}
							sx={{
								width: '110px',
							}}
						>
							{errorLevelLabels[level]}
						</Button>
					))}
				</ButtonGroup>
			</Stack>

			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					p: 2,
					border: '1px solid',
					borderColor: 'divider',
					borderRadius: 1,
					bgcolor: 'white',
					minHeight: 384,
					alignItems: 'center',
					overflow: 'hidden',
					position: 'relative',
				}}
			>
				{hasContent && (
					<>
						<canvas ref={previewCanvasRef} />
						<canvas
							ref={downloadCanvasRef}
							style={{ width: '100%', height: '100%', opacity: '0', position: 'absolute' }}
						/>
					</>
				)}
			</Box>

			<Stack spacing={1}>
				<Typography variant="body2" color="text.secondary">
					Download size: <b>{size}px</b>
				</Typography>
				<Slider value={size} onChange={(_, v) => setSize(v as number)} min={128} max={1024} step={16} />
			</Stack>

			<Divider />

			<Stack direction="row" justifyContent="flex-end" spacing={2}>
				<Button variant="contained" onClick={downloadPng} disabled={!hasContent}>
					Download PNG
				</Button>
				<Button variant="outlined" onClick={downloadSvg} disabled={!hasContent}>
					Download SVG
				</Button>
			</Stack>
		</Stack>
	)
}

function useDebounce<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value)

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay)
		return () => clearTimeout(timer)
	}, [value, delay])

	return debounced
}
