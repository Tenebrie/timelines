import { isRunningInTest } from '@/test-utils/isRunningInTest'

export const LineSpacing = isRunningInTest() ? 10 : 20
