import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { jwtConstants } from '../../constants'
import { AuthService } from 'src/auth/auth.service'
import { JwtPayload } from './JwtPayload'
import { UserService } from 'src/user/user.service'
import { User } from 'src/user/entities/user.entity'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(private authService: AuthService, private usersService: UserService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtConstants.secret,
		})
	}

	async validate(payload: JwtPayload): Promise<User> {
		return this.usersService.findById(payload.id)
	}
}
