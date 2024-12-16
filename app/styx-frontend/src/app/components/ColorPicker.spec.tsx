import '@testing-library/jest-dom'

import { fireEvent, render, screen } from '@testing-library/react'

import { ColorPicker } from './ColorPicker'

describe('ColorPicker', () => {
	it('renders correctly with initial value', () => {
		render(<ColorPicker initialValue="hsl(180, 100%, 50%)" />)
		const colorBox = screen.getByTestId('color-preview')
		expect(colorBox).toHaveStyle({ backgroundColor: 'hsl(180, 100%, 50%)' })
	})

	describe('hsl', () => {
		it('does not call onChange unnecessarily', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHsl={handleChange} />)
			expect(handleChange).not.toHaveBeenCalled()
		})

		it('respects changing the hue slider', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHsl={handleChange} />)
			const hueSlider = screen.getAllByRole('slider')[0]
			fireEvent.change(hueSlider, { target: { value: 200 } })
			expect(handleChange).toHaveBeenCalledWith('hsl(200, 100%, 50%)')
			expect(screen.getByDisplayValue('hsl(200, 100%, 50%)')).toBeInTheDocument()
		})

		it('respects changing the saturation slider', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHsl={handleChange} />)
			const hueSlider = screen.getAllByRole('slider')[1]
			fireEvent.change(hueSlider, { target: { value: 25 } })
			expect(handleChange).toHaveBeenCalledWith('hsl(180, 25%, 50%)')
			expect(screen.getByDisplayValue('hsl(180, 25%, 50%)')).toBeInTheDocument()
		})

		it('respects changing the lightness slider', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHsl={handleChange} />)
			const hueSlider = screen.getAllByRole('slider')[2]
			fireEvent.change(hueSlider, { target: { value: 80 } })
			expect(handleChange).toHaveBeenCalledWith('hsl(180, 100%, 80%)')
			expect(screen.getByDisplayValue('hsl(180, 100%, 80%)')).toBeInTheDocument()
		})
	})

	describe('hex', () => {
		it('does not call onChange unnecessarily', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHex={handleChange} />)
			expect(handleChange).not.toHaveBeenCalled()
		})

		it('respects changing the hue slider', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHex={handleChange} />)
			const hueSlider = screen.getAllByRole('slider')[0]
			fireEvent.change(hueSlider, { target: { value: 200 } })
			expect(handleChange).toHaveBeenCalledWith('#00aaff')
			expect(screen.getByDisplayValue('hsl(200, 100%, 50%)')).toBeInTheDocument()
		})

		it('respects changing the saturation slider', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHex={handleChange} />)
			const hueSlider = screen.getAllByRole('slider')[1]
			fireEvent.change(hueSlider, { target: { value: 25 } })
			expect(handleChange).toHaveBeenCalledWith('#609f9f')
			expect(screen.getByDisplayValue('hsl(180, 25%, 50%)')).toBeInTheDocument()
		})

		it('respects changing the lightness slider', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHex={handleChange} />)
			const hueSlider = screen.getAllByRole('slider')[2]
			fireEvent.change(hueSlider, { target: { value: 80 } })
			expect(handleChange).toHaveBeenCalledWith('#99ffff')
			expect(screen.getByDisplayValue('hsl(180, 100%, 80%)')).toBeInTheDocument()
		})
	})

	it('displays the initial color in the input field', () => {
		render(<ColorPicker initialValue="hsl(255, 74%, 49%)" />)
		expect(screen.getByDisplayValue('hsl(255, 74%, 49%)')).toBeInTheDocument()
	})

	it('displays the default color in the input field', () => {
		render(<ColorPicker />)
		expect(screen.getByDisplayValue('hsl(180, 100%, 50%)')).toBeInTheDocument()
	})
})
