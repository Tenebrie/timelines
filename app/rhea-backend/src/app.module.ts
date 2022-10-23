import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserController } from './user/user.controller'

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'localhost', // replace with 'postgres' for Docker
			port: 5432,
			username: 'docker',
			password: 'docker',
			database: 'db',
			entities: [],
			synchronize: false,
		}),
	],
	controllers: [AppController, UserController],
	providers: [AppService],
})
export class AppModule {}
