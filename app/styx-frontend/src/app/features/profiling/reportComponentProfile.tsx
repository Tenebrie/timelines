import { PerformanceMetrics } from './PerformanceMetrics'

export const reportComponentProfile = (
	id: string,
	phase: string,
	actualDuration: number,
	baseDuration: number,
	startTime: number,
	commitTime: number,
) => {
	PerformanceMetrics.components[id] = {
		id,
		renderCount: (PerformanceMetrics.components[id]?.renderCount ?? 0) + 1,
		totalBaseDuration: (PerformanceMetrics.components[id]?.totalBaseDuration ?? 0) + baseDuration,
		totalActualDuration: (PerformanceMetrics.components[id]?.totalActualDuration ?? 0) + actualDuration,
	}
}
