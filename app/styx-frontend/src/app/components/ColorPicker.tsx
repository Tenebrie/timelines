import OutlinedInput from '@mui/material/OutlinedInput'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { darkTheme, lightTheme } from '../features/theming/themes'
import { colorStringToHsl, colorStringToHslWithDefault } from '../utils/colors/colorStringToHsl'
import { hslToHex } from '../utils/colors/hslToHex'
import { ColoredChip } from './ColoredChip'

type Props = {
	initialValue?: string
	onChangeHex?: (value: string) => void
	onChangeHsl?: (value: string) => void
}

export const ColorPicker = ({ initialValue, onChangeHex, onChangeHsl }: Props) => {
	const parsedValue = useMemo(
		() => colorStringToHslWithDefault(initialValue ?? 'hsl(180, 100%, 50%)', { h: 0.5, s: 1, l: 0.5 }),
		[initialValue],
	)

	const [inputValue, setInputValue] = useState<string | null>(null)

	const [hue, setHue] = useState(Math.round(parsedValue.h * 360))
	const [saturation, setSaturation] = useState(Math.round(parsedValue.s * 100))
	const [lightness, setLightness] = useState(Math.round(parsedValue.l * 100))

	const calculatedHue = useMemo(() => Math.round(hue), [hue])
	const color = useMemo(
		() => `hsl(${calculatedHue}, ${saturation}%, ${lightness}%)`,
		[calculatedHue, lightness, saturation],
	)

	const onSetFullValue = (value: string) => {
		setInputValue(value)

		try {
			const parsedValue = colorStringToHsl(value)
			setHue(Math.max(0, Math.min(360, Math.round(parsedValue.h * 360))))
			setSaturation(Math.max(0, Math.min(100, Math.round(parsedValue.s * 100))))
			setLightness(Math.max(0, Math.min(100, Math.round(parsedValue.l * 100))))
		} catch {
			//
		}
	}

	useEffect(() => {
		const hexValue = hslToHex(hue / 360, saturation / 100, lightness / 100)
		if (hexValue === initialValue || color === initialValue) {
			return
		}

		onChangeHex?.(hexValue)
		onChangeHsl?.(color)
	}, [calculatedHue, color, lightness, onChangeHex, onChangeHsl, saturation, hue, initialValue])

	const hueShowColor = `hsl(${calculatedHue}, ${saturation}%, ${lightness}%)`
	const saturationShowColor = `hsl(${calculatedHue}, ${saturation}%, ${lightness}%)`

	return (
		<Stack direction="row" gap={4}>
			<Stack direction="column" justifyContent="space-between" gap={1}>
				<Stack direction="row" sx={{ width: '100%', height: '100%' }} gap={1}>
					<div
						data-testid="color-preview"
						style={{
							backgroundColor: color,
							width: '50%',
							height: '100%',
							borderRadius: '4px',
						}}
					></div>
					<Stack direction="column" sx={{ width: '50%', height: '100%' }} gap={1}>
						<div
							style={{
								backgroundColor: lightTheme.palette.background.paper,
								width: '100%',
								height: '100%',
								borderRadius: '4px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<ColoredChip text="Name" color={color} />
						</div>
						<div
							style={{
								backgroundColor: darkTheme.palette.background.paper,
								width: '100%',
								height: '100%',
								borderRadius: '4px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<ColoredChip text="Name" color={color} />
						</div>
					</Stack>
				</Stack>
				<OutlinedInput
					size="small"
					sx={{ width: '192px' }}
					value={inputValue ?? color}
					onChange={(event) => onSetFullValue(event.target.value)}
				/>
			</Stack>
			<Stack
				direction="column"
				width="100%"
				gap={1}
				sx={{
					'* .MuiSlider-rail': {
						'--hue': `${hue}deg`,
						'--saturation': `${saturation}%`,
						'--lightness': `${lightness}%`,
					},
				}}
			>
				<Stack
					direction="row"
					gap={4}
					sx={{
						alignItems: 'center',
					}}
				>
					<HueSlider
						step={1}
						max={360}
						$color={hueShowColor}
						value={hue}
						onChange={(_, value) => {
							setHue(value as number)
							setInputValue(null)
						}}
					/>
					<OutlinedInput
						size="small"
						sx={{ width: '110px' }}
						type="number"
						value={calculatedHue}
						onChange={(event) => {
							setHue(Math.max(0, Math.min(360, Math.round(Number(event.target.value)))))
							setInputValue(null)
						}}
					/>
				</Stack>
				<Stack direction="row" gap={4} sx={{ alignItems: 'center' }}>
					<SaturationSlider
						step={1}
						$color={saturationShowColor}
						value={saturation}
						onChange={(_, value) => {
							setSaturation(value as number)
							setInputValue(null)
						}}
					/>
					<OutlinedInput
						size="small"
						sx={{ width: '110px' }}
						type="number"
						value={saturation}
						onChange={(event) => {
							setSaturation(Math.max(0, Math.min(100, Math.round(Number(event.target.value)))))
							setInputValue(null)
						}}
					/>
				</Stack>
				<Stack direction="row" gap={4} sx={{ alignItems: 'center' }}>
					<LightnessSlider
						step={1}
						$color={color}
						value={lightness}
						onChange={(_, value) => {
							setLightness(value as number)
							setInputValue(null)
						}}
					/>
					<OutlinedInput
						size="small"
						sx={{ width: '110px' }}
						type="number"
						value={lightness}
						onChange={(event) => {
							setLightness(Math.max(0, Math.min(100, Math.round(Number(event.target.value)))))
							setInputValue(null)
						}}
					/>
				</Stack>
			</Stack>
		</Stack>
	)
}

const BaseSlider = styled(Slider).attrs<{ $color: string }>((props) => ({
	style: {
		color: props.$color,
	},
}))`
	height: 64px;
	transition: none;

	.MuiSlider-thumb {
		transition: none;
	}

	.MuiSlider-rail {
		opacity: 1;
		height: 12px;
		transition: none;
	}

	.MuiSlider-track {
		display: none;
	}
`

const HueSlider = styled(BaseSlider)`
	.MuiSlider-rail {
		background: linear-gradient(
			90deg,
			hsl(0, var(--saturation), var(--lightness)) 0%,
			hsl(60, var(--saturation), var(--lightness)) 17%,
			hsl(120, var(--saturation), var(--lightness)) 33%,
			hsl(180, var(--saturation), var(--lightness)) 50%,
			hsl(240, var(--saturation), var(--lightness)) 67%,
			hsl(300, var(--saturation), var(--lightness)) 83%,
			hsl(360, var(--saturation), var(--lightness)) 100%
		);
	}
`

const SaturationSlider = styled(BaseSlider)`
	.MuiSlider-rail {
		background: linear-gradient(
			90deg,
			hsl(var(--hue), 0%, var(--lightness)) 0%,
			hsl(var(--hue), 100%, var(--lightness)) 100%
		);
	}
`

const LightnessSlider = styled(BaseSlider)`
	.MuiSlider-rail {
		background: linear-gradient(
			90deg,
			hsl(var(--hue), var(--saturation), 0%) 0%,
			hsl(var(--hue), var(--saturation), 50%) 50%,
			hsl(var(--hue), var(--saturation), 100%) 100%
		);
	}
`
