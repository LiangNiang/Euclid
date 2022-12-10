import { PrismaClient } from '@euclid/common'

export function initDBInstance() {
  const prisma = new PrismaClient()
  return prisma
}
