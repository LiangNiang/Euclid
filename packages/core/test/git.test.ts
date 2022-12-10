import { test, expect, describe, vi } from 'vitest'
import fs from 'node:fs'
import {
  getGitWorkDIR,
  initGitInstance,
  genAuthorizedRepoPath,
  cloneRemoteRepoToLocal
} from '../src/git'
import { CONFIG } from '@euclid/common'

vi.mock('../src/utils', () => {
  return {
    genRandomLowercaseString: () => 'abcdefg'
  }
})

describe('git module test', () => {
  test('getGitWorkDIR 空参数', () => {
    // @ts-ignore
    CONFIG.GIT_WORK_DIR = ''
    const dir = getGitWorkDIR()
    expect(dir).toEqual(`${process.cwd()}/.gitWorkDir`)
  })

  test('getGitWorkDIR 有 GIT_WORK_DIR 配置', () => {
    // @ts-ignore
    CONFIG.GIT_WORK_DIR = '/aaa'
    const dir = getGitWorkDIR()
    expect(dir).toEqual('/aaa')
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
        "baseDir": "/aaa",
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
