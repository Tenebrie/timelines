import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
	const hashedPassword = await bcrypt.hash('q', 8)
	await prisma.user.create({
		data: {
			email: 'admin@localhost',
			username: 'Administrator',
			password: hashedPassword,
			level: 'Admin',
		},
	})
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
