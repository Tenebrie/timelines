import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LocalStrategy } from './strategies/local/local.strategy'
import { JwtStrategy } from './strategies/jwt/jwt.strategy'
import { UsersModule } from '../user/user.module'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from './constants'

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: '30d' },
		}),
	],
	providers: [AuthService, LocalStrategy, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}
