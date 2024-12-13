import { isRunningInTest } from '@/jest/isRunningInTest'

export const LineSpacing = isRunningInTest() ? 10 : 20
