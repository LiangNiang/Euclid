import { describe, test, beforeAll, expect, vi, afterEach } from 'vitest'
import { TEST_CONFIG_1, TEST_CONFIG_2, TEST_CONFIG_3 } from '../consts/test-config'
import Core from '../../src/core'

vi.mock('is-url', () => {
  return {
    default: (v: string) => v === 'remoteremote' || v === TEST_CONFIG_3.project.repoPath
  }
})

vi.mock('../../src/git', async () => {
  const actual = await vi.importActual('../../src/git')
  return {
    // @ts-ignore
    ...actual,
    cloneRemoteRepoToLocal: (git: unknown, project: { repoPath: string }) => {
      if (project.repoPath === TEST_CONFIG_3.project.repoPath) {
        throw new Error('clone error test')
      }
      return 'cloneRemoteRepoToLocal'
    }
  }
})

describe('core module clone test', () => {
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

  afterEach(async () => {
    await core.prisma.project.deleteMany()
    await core.prisma.user.deleteMany({
      where: {
        username: 'LiangNiang'
      }
    })
  })

  test('clone', async () => {
    // 本地仓库
    const res1 = await core.clone({
      project: TEST_CONFIG_1.project,
      user: TEST_CONFIG_1.user
    })
    const expect1 = await core.prisma.project.findFirst()
    expect(res1).toEqual(expect1?.id)
    expect(expect1?.repoType).toEqual('local')
    await core.prisma.project.delete({ where: { id: expect1?.id } })

    // 远程仓库
    const res2 = await core.clone({
      project: TEST_CONFIG_2.project,
      user: TEST_CONFIG_2.user
    })
    const expect2 = await core.prisma.project.findFirst()
    expect(res2).toEqual(expect2?.id)
    expect(expect2?.dirName).toEqual('cloneRemoteRepoToLocal')
    expect(expect2?.repoType).toEqual('remote')
    await core.prisma.project.delete({ where: { id: expect2?.id } })

    // 远程仓库 error
    const expect3 = async () => {
      return await core.clone({
        project: TEST_CONFIG_3.project,
        user: TEST_CONFIG_3.user
      })
    }
    expect(expect3()).rejects.toMatchInlineSnapshot('[Error: clone error test]')
  })
})
