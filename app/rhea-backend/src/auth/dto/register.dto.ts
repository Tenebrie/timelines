import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto {
	@ApiProperty()
	email: string

	@ApiProperty()
	username: string

	@ApiProperty()
	password: string
}
