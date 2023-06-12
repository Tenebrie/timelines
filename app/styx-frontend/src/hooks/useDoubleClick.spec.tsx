import { act } from '@testing-library/react'

import { renderHookWithProviders } from '../jest/renderWithProviders'
import { useDoubleClick } from './useDoubleClick'

describe('useDoubleClick', () => {
	beforeAll(() => {
		jest.useFakeTimers()
	})

	afterAll(() => {
		jest.useRealTimers()
	})

	it('performs a single click after delay only', async () => {
		const onClickSpy = jest.fn()
		const onDoubleClickSpy = jest.fn()

		const { result } = renderHookWithProviders(() =>
			useDoubleClick<void>({
				onClick: onClickSpy,
				onDoubleClick: onDoubleClickSpy,
			})
		)
		const { triggerClick } = result.current

		act(() => {
			triggerClick()
		})

		expect(onClickSpy).not.toBeCalled()
		expect(onDoubleClickSpy).not.toBeCalled()

		jest.advanceTimersByTime(1000)

		expect(onClickSpy).toBeCalled()
		expect(onDoubleClickSpy).not.toBeCalled()
	})

	it('ignores delay if parameter is provided', async () => {
		const onClickSpy = jest.fn()
		const onDoubleClickSpy = jest.fn()

		const { result } = renderHookWithProviders(() =>
			useDoubleClick<void>({
				onClick: onClickSpy,
				onDoubleClick: onDoubleClickSpy,
				ignoreDelay: true,
			})
		)
		const { triggerClick } = result.current

		act(() => {
			triggerClick()
		})

		expect(onClickSpy).toBeCalledTimes(1)
		expect(onDoubleClickSpy).not.toBeCalled()

		jest.advanceTimersByTime(1000)

		expect(onClickSpy).toBeCalledTimes(1)
		expect(onDoubleClickSpy).not.toBeCalled()
	})

	it('performs a double click immediately', async () => {
		const onClickSpy = jest.fn()
		const onDoubleClickSpy = jest.fn()

		const { result } = renderHookWithProviders(() =>
			useDoubleClick<void>({
				onClick: onClickSpy,
				onDoubleClick: onDoubleClickSpy,
			})
		)
		const { triggerClick } = result.current

		act(() => {
			triggerClick()
			triggerClick()
		})

		expect(onClickSpy).not.toBeCalled()
		expect(onDoubleClickSpy).toBeCalled()

		jest.advanceTimersByTime(1000)

		expect(onClickSpy).not.toBeCalled()
	})

	it('passes parameters on single click', async () => {
		const onClickSpy = jest.fn()
		const onDoubleClickSpy = jest.fn()

		const { result } = renderHookWithProviders(() =>
			useDoubleClick<{ foo: string }>({
				onClick: onClickSpy,
				onDoubleClick: onDoubleClickSpy,
			})
		)
		const { triggerClick } = result.current

		act(() => {
			triggerClick({
				foo: 'my value',
			})
		})

		jest.advanceTimersByTime(1000)

		expect(onClickSpy).toBeCalledWith({
			foo: 'my value',
		})
	})

	it('passes paremeters on double click', async () => {
		const onClickSpy = jest.fn()
		const onDoubleClickSpy = jest.fn()

		const { result } = renderHookWithProviders(() =>
			useDoubleClick<{ foo: string }>({
				onClick: onClickSpy,
				onDoubleClick: onDoubleClickSpy,
			})
		)
		const { triggerClick } = result.current

		act(() => {
			triggerClick({
				foo: 'my value',
			})
			triggerClick({
				foo: 'my value',
			})
		})

		expect(onDoubleClickSpy).toBeCalledWith({
			foo: 'my value',
		})
	})
})
