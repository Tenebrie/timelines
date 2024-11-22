export const PerformanceMetrics = {
	components: {} as Record<
		string,
		{
			id: string
			renderCount: number
			totalBaseDuration: number
			totalActualDuration: number
		}
	>,
}
