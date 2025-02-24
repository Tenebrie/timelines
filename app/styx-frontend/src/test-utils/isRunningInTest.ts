export const isRunningInTest = () => import.meta.env.VITEST_WORKER_ID !== undefined
