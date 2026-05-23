export const isRunningInTest = () =>
	process.env.VITEST_WORKER_ID !== undefined || process.env.RSTEST_WORKER_ID !== undefined
