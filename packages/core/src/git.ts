import path from 'node:path'
import fs from 'node:fs'
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git'
import { genRandomLowercaseString } from './utils'

export function getGitWorkDIR() {
  const GIT_WORK_DIR = process.env.GIT_WORK_DIR || '.gitWorkDir'
  return path.resolve(process.cwd(), GIT_WORK_DIR)
}

/**
 * 初始化 git 工作目录
 */
function initGitDir() {
  const baseDir = getGitWorkDIR()
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir)
  }
  return baseDir
}

/**
 * 初始化 git 实例
 */
export function initGitInstance() {
  const options: Partial<SimpleGitOptions> = {
    baseDir: initGitDir(),
    binary: 'git',
    maxConcurrentProcesses: 6,
    trimmed: false
  }

  return simpleGit(options)
}

/**
 * @param repoPath repo 的地址
 * @param userInfo git 用户的基本信息
 * @param accessToken git 用户的 accessToken
 * @returns 一个带有授权的 repo 地址
 */
export function genAuthorizedRepoPath(
  repoPath: string,
  userInfo?: NUser.InputParam,
  accessToken?: string
) {
  const urlData = new URL(repoPath)
  const { protocol, host, pathname } = urlData
  if (!userInfo) return repoPath
  return `${protocol}//${[userInfo.username, accessToken]
    .filter(Boolean)
    .join(':')}@${host}${pathname}`
}

export async function cloneRemoteRepoToLocal(
  git: SimpleGit,
  project: NProject.InputParam,
  user?: NUser.InputParam
) {
  const dirName: NProject.Item['dirName'] = genRandomLowercaseString()
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN
  await git.clone(genAuthorizedRepoPath(project.repoPath, user, ACCESS_TOKEN), dirName, [
    `-b${project.branch}`,
    '--depth=1'
  ])
  return dirName
}
