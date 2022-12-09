import { test, expect, describe, vi } from 'vitest'
import fs from 'node:fs'
import {
  getGitWorkDIR,
  initGitInstance,
  genAuthorizedRepoPath,
  cloneRemoteRepoToLocal
} from '../src/git'

vi.mock('../src/utils', () => {
  return {
    genRandomLowercaseString: () => 'abcdefg'
  }
})

describe('git module test', () => {
  test('getGitWorkDIR 空参数', () => {
    const dir = getGitWorkDIR()
    expect(dir).toEqual(`${process.cwd()}/.gitWorkDir`)
  })

  test('getGitWorkDIR 有 GIT_WORK_DIR 配置', () => {
    const t = process.cwd()
    vi.stubGlobal('process', {
      env: { GIT_WORK_DIR: '/home/liangniang/euclid-tmp' },
      cwd: () => t
    })
    const dir = getGitWorkDIR()
    expect(dir).toEqual('/home/liangniang/euclid-tmp')
  })

  test('initGitInstance', () => {
    vi.mock('simple-git', () => {
      return {
        default: (arg: unknown) => arg
      }
    })
    vi.mock('fs', () => {
      return {
        default: {
          existsSync: vi.fn(() => false),
          mkdirSync: vi.fn()
        }
      }
    })
    const res = initGitInstance()
    expect(fs.existsSync).toHaveReturnedWith(false)
    expect(fs.mkdirSync).toHaveBeenCalledTimes(1)
    expect(res).toMatchInlineSnapshot(`
      {
        "baseDir": "/home/liangniang/euclid-tmp",
        "binary": "git",
        "maxConcurrentProcesses": 6,
        "trimmed": false,
      }
    `)
  })

  test('genAuthorizedRepoPath', () => {
    const path1 = genAuthorizedRepoPath('https://github.com/LiangNiang/Euclid.git')
    expect(path1).toEqual('https://github.com/LiangNiang/Euclid.git')

    const path2 = genAuthorizedRepoPath('https://github.com/LiangNiang/Euclid.git', {
      username: 'LiangNiang'
    })
    expect(path2).toEqual('https://LiangNiang@github.com/LiangNiang/Euclid.git')

    const path3 = genAuthorizedRepoPath(
      'https://github.com/LiangNiang/Euclid.git',
      {
        username: 'LiangNiang'
      },
      'vdsvsdvdsv'
    )
    expect(path3).toEqual('https://LiangNiang:vdsvsdvdsv@github.com/LiangNiang/Euclid.git')

    expect(() =>
      genAuthorizedRepoPath('/Users/liang/euclid-tmp/evqerv')
    ).toThrowErrorMatchingInlineSnapshot('"Invalid URL"')
  })

  test('cloneRemoteRepoToLocal', async () => {
    const clone = vi.fn()

    const res = await cloneRemoteRepoToLocal(
      // @ts-ignore
      { clone },
      { repoPath: 'https://github.com/LiangNiang/Euclid.git' }
    )
    expect(clone).toHaveBeenCalledTimes(1)
    expect(res).toEqual('abcdefg')
    const f = async () => {
      await await cloneRemoteRepoToLocal(
        // @ts-ignore
        { clone },
        { repoPath: 'aaaa' }
      )
    }
    expect(f()).rejects.toThrowErrorMatchingInlineSnapshot('"Invalid URL"')
  })
})
