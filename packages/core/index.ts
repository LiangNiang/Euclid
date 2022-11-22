import { SimpleGit, SimpleGitOptions } from 'simple-git'
import { simpleGit } from 'simple-git'
import path from 'node:path'
import fs from 'node:fs'
import { nanoid, customAlphabet } from 'nanoid'
import dotenv from 'dotenv'
import { basicUserInfo, projectInfo } from './mockData'
import * as shell from 'shelljs'
import knex, { Knex } from 'knex'
import { stringify } from 'yaml'
import defaultDockerComposeConfig from './default-docker-compose.json'

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

const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: './data.db'
  }
}

const knexInstance = knex(config)


function genAuthorizedRepoPath(repoPath: string, userInfo: UserInfo, accessToken: string) {
  const urlData = new URL(repoPath)
  const { protocol, host, pathname } = urlData
  return `${protocol}//${userInfo.username}:${accessToken}@${host}${pathname}`
}

async function doClone() {
  const localDir = nanoid()
  try {
    console.log('clone start')
    await git.clone(genAuthorizedRepoPath(projectInfo.repoPath, basicUserInfo, ACCESS_TOKEN), localDir, [`-b${projectInfo.branch}`, '--depth=1'])
    await knexInstance('projects').insert({
      ...projectInfo,
      dirName: localDir
    })
    console.log('clone success')
  } catch (err) {
    console.log(err)
  }
}

async function run(id: number) {
  // await knexInstance('projects')
  const p = await knexInstance('projects').where({ id }).first()
  if (!p) throw new Error('project not found')
  console.log(p)
  console.log(`current work dir: ${shell.pwd().toString()}`)
  console.log('to proj dir')
  shell.cd(`./.workdir/${p.dirName}`)
  console.log(`current work dir: ${shell.pwd().toString()}`)
  const nameSuffix = customAlphabet('abcdefghijklmnopqrstuvwxyz')()
  const appName = `${p.appName}-${nameSuffix}`
  const newConfig = { ...defaultDockerComposeConfig }
  newConfig.services.http.image = appName
  newConfig.services.http.container_name = appName
  newConfig.services.http.labels = [
    'traefik.enable=true',
    `traefik.http.routers.${appName}.rule=Host(\`${p.domainPrefix}.\${DOMAIN_NAME}\`)`,
    `traefik.http.routers.${appName}.service=${appName}`,
    `traefik.http.services.${appName}.loadbalancer.server.port=80`
  ]
  shell.exec(`docker build -t ${appName} .`)
  fs.writeFileSync('./docker-compose.yaml', stringify(newConfig))
  shell.exec('docker-compose up -d')
}

(async () => {
  await knexInstance.schema.createTableIfNotExists('projects', project => {
    project.increments('id')
    project.string('repoPath')
    project.string('branch')
    project.string('dirName')
    project.string('appName')
    project.string('domainPrefix')
  })
  // await run(1)
  // doClone()
})()
