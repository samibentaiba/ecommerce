// /home/sami/Documents/GitHub/ecommerce/prisma/seeders/users.ts

import prisma from '&/prisma'
import { Role } from '@prisma/client'
import { safeCreate } from '../utils/handler'
import bcrypt from 'bcryptjs'

export default async function seedUsers() {
  const existing = await prisma.user.findUnique({
    where: { id: 'singleton' },
  })

  if (existing) {
    console.log('✅ Singleton admin user already exists.')
    return
  }

  const password = 'admin1234'
  const hashedPassword = await bcrypt.hash(password, 10)

  await safeCreate('singleton admin user', () =>
    prisma.user.create({
      data: {
        id: 'singleton', // singleton enforced
        email: 'admin@store.com',
        name: 'Admin',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    })
  )
}

