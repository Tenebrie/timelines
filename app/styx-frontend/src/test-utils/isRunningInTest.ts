export const isRunningInTest = () =>
	typeof process !== 'undefined' && process.env.RSTEST_WORKER_ID !== undefined
