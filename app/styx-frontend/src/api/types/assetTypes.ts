import { ListUserAssetsApiResponse, RequestPresignedUrlApiArg } from '@api/assetApi'

export type AssetType = RequestPresignedUrlApiArg['body']['assetType']
export type Asset = ListUserAssetsApiResponse['assets'][number]
