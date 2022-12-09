import { describe, test, beforeAll, afterAll, expect } from 'vitest'

import { TEST_CONFIG_1 } from './consts/test-config'
import Core from '../src/core'

describe('core module test', () => {
  const core = new Core()

  beforeAll(async () => {
    await core.prisma.user.create({
      data: {
        username: 'LiangNiang',
        password: 'abcdefg',
        salt: 'abcdefg'
      }
    })
  })

  afterAll(async () => {
    await core.prisma.project.deleteMany()
    await core.prisma.user.deleteMany({
      where: {
        username: 'LiangNiang'
      }
    })
  })

  test('clone', async () => {
    const res1 = await core.clone({
      project: TEST_CONFIG_1.project,
      user: TEST_CONFIG_1.user
    })
    const expect1 = await core.prisma.project.findFirst()
    console.log(expect1)
    expect(res1).toEqual(expect1?.id)
  })
})
