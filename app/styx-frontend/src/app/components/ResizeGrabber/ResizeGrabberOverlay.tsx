import { useResizeGrabber } from './ResizeGrabber'

type Props = ReturnType<typeof useResizeGrabber>

export function ResizeGrabberOverlay({ overflowHeight }: Props) {
	return (
		<div
			style={{
				backgroundColor: `rgba(255, 255, 255, ${overflowHeight < 0 ? 0.1 : 0.0})`,
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				pointerEvents: 'none',
				borderRadius: '6px',
				transition: 'background-color 0.3s',
			}}
		/>
	)
}
