// Cubic-bezier helper that returns an easing function.
export function createCubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
	const cx = 3 * p1x
	const bx = 3 * (p2x - p1x) - cx
	const ax = 1 - cx - bx

	const cy = 3 * p1y
	const by = 3 * (p2y - p1y) - cy
	const ay = 1 - cy - by

	function sampleCurveX(t: number): number {
		return ((ax * t + bx) * t + cx) * t
	}
	function sampleCurveY(t: number): number {
		return ((ay * t + by) * t + cy) * t
	}
	function sampleCurveDerivativeX(t: number): number {
		return (3 * ax * t + 2 * bx) * t + cx
	}
	// Given an x value, find t using Newton-Raphson iteration.
	function solveCurveX(x: number): number {
		let t = x
		for (let i = 0; i < 8; i++) {
			const xEstimate = sampleCurveX(t) - x
			if (Math.abs(xEstimate) < 1e-6) {
				return t
			}
			const d = sampleCurveDerivativeX(t)
			if (Math.abs(d) < 1e-6) break
			t = t - xEstimate / d
		}
		return t
	}

	return function (t: number): number {
		return sampleCurveY(solveCurveX(t))
	}
}
