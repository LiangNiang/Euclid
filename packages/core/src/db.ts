import { PrismaClient } from '@prisma/client'

export function initDBInstance() {
  const prisma = new PrismaClient()
  return prisma
}
