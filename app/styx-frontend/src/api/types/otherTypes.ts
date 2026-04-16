import { ListFeatureFlagsApiResponse } from '@api/otherApi'

export type FeatureFlag = ListFeatureFlagsApiResponse['featureFlags'][number]
