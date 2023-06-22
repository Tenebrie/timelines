import { act } from '@testing-library/react'
import { MouseEvent } from 'react'

import { renderHookWithProviders } from '../jest/renderWithProviders'
import { useDoubleClick } from './useDoubleClick'

describe('useDoubleClick', () => {
	beforeAll(() => {
		jest.useFakeTimers()
	})

	afterAll(() => {
		jest.useRealTimers()
	})

	const mockMouseEvent = (data: { target?: any } = {}) =>
		({
			target: 'div1',
			...data,
		} as MouseEvent)

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
			triggerClick(mockMouseEvent())
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
			triggerClick(mockMouseEvent())
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
			triggerClick(mockMouseEvent())
			triggerClick(mockMouseEvent())
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
			triggerClick(mockMouseEvent(), {
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
			triggerClick(mockMouseEvent(), {
				foo: 'my value',
			})
			triggerClick(mockMouseEvent(), {
				foo: 'my value',
			})
		})

		expect(onDoubleClickSpy).toBeCalledWith({
			foo: 'my value',
		})
	})

	it('does not trigger double click if targets are different', async () => {
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
			triggerClick(
				mockMouseEvent({
					target: 'div1',
				}),
				{
					foo: 'my value',
				}
			)
			triggerClick(
				mockMouseEvent({
					target: 'div2',
				}),
				{
					foo: 'my value',
				}
			)
		})

		expect(onDoubleClickSpy).not.toHaveBeenCalled()
	})
})
