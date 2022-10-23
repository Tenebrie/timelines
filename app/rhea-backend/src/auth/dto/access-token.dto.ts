import { ApiProperty } from '@nestjs/swagger'

export class AccessTokenDto {
	@ApiProperty()
	accessToken: string
}
