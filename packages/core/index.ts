import { SimpleGit, SimpleGitOptions } from 'simple-git'
import { simpleGit } from 'simple-git'
import path from 'node:path'
import fs from 'node:fs'
import { nanoid } from 'nanoid'
import dotenv from 'dotenv'
import { basicUserInfo, projectInfo } from './mockData'

dotenv.config()

const baseDir = path.resolve(process.cwd(), '.workDir')
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir)
}

const ACCESS_TOKEN = process.env.ACCESS_TOKEN

const options: Partial<SimpleGitOptions> = {
  baseDir,
  binary: 'git',
  maxConcurrentProcesses: 6,
  trimmed: false,
}

const git: SimpleGit = simpleGit(options)

function genAuthorizedRepoPath(repoPath: string, userInfo: UserInfo, accessToken: string) {
  console.log(repoPath)
  const urlData = new URL(repoPath)
  console.log(urlData)
  const { protocol, host, pathname } = urlData
  return `${protocol}//${userInfo.username}:${accessToken}@${host}${pathname}`
}

async function doClone() {
  const localDir = nanoid()
  try {
    console.log('clone start')
    await git.clone(genAuthorizedRepoPath(projectInfo.repoPath, basicUserInfo, ACCESS_TOKEN), localDir, [`-b${projectInfo.branch}`, '--depth=1'])
    console.log('clone success')
  } catch (err) {
    console.log(err)
  }
}
