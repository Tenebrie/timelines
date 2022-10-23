import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthController } from './auth/auth.controller'
import { AuthModule } from './auth/auth.module'
import { LocalDataSource } from './db/LocalDataSource'
import { UserController } from './user/user.controller'
import { UsersModule } from './user/user.module'

@Module({
	imports: [
		TypeOrmModule.forRoot({
			...LocalDataSource,
			synchronize: false,
		}),
		UsersModule,
		AuthModule,
	],
	controllers: [AppController, AuthController, UserController],
	providers: [AppService],
})
export class AppModule {}
