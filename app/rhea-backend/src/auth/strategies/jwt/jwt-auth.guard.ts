import { applyDecorators, Injectable, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth } from '@nestjs/swagger'

@Injectable()
class BaseJwtAuthGuard extends AuthGuard('jwt') {}

export function JwtAuthGuard() {
	return applyDecorators(UseGuards(BaseJwtAuthGuard), ApiBearerAuth)
}
