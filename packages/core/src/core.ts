import { SimpleGit } from 'simple-git'
import path from 'node:path'
import fs from 'node:fs'
import shelljs from 'shelljs'
import { initDBInstance } from './db'
import { cloneRemoteRepoToLocal, getGitWorkDIR, initGitInstance } from './git'
import { genRandomLowercaseString } from './utils'
import defaultDockerComposeConfig from './default-docker-compose.json'
import { stringify } from 'yaml'
import isURL from 'is-url'
import { safeCD } from './shellWrapper'
import { initDockerInstance, rmDockerComposeContainer } from './docker'
import { PrismaClient, RunMode } from '@euclid/common'
import { readJSON } from 'fs-extra'
import frameworkList from '@vercel/frameworks'
import { LocalFileSystemDetector, detectFramework, detectBuilders } from '@vercel/fs-detectors'
import { CONFIG } from '@euclid/common'

class Core {
  git: SimpleGit
  prisma!: InstanceType<typeof PrismaClient>
  docker: ReturnType<typeof initDockerInstance>

  constructor() {
    this.git = initGitInstance()
    this.prisma = initDBInstance()
    this.docker = initDockerInstance()
  }

  async clone(config: { project: NProject.InputParam; user: NUser.InputParam }) {
    const { project, user } = config
    const { repoPath } = project
    if (isURL(repoPath)) {
      // remote repo
      let dirName
      try {
        console.log('Project clone start')
        dirName = await cloneRemoteRepoToLocal(this.git, project, user)
        const res = await this.prisma.project.create({
          data: {
            ...project,
            repoType: 'remote',
            dirName,
            user: {
              connect: { username: user.username }
            }
          }
        })
        console.log('Project clone success')
        return res.id
      } catch (err) {
        console.error('Project clone error')
        throw err
      }
    } else {
      const res = await this.prisma.project.create({
        data: {
          ...project,
          repoType: 'local',
          user: {
            connect: { username: user.username }
          }
        }
      })
      return res.id
    }
  }

  genDockerComposeConfig(serviceName: string, domainName: string) {
    const newConfig = { ...defaultDockerComposeConfig }
    // @ts-ignore
    newConfig.services[serviceName] = {
      image: serviceName,
      container_name: serviceName,
      build: {
        context: '.',
        dockerfile: 'Dockerfile'
      },
      environment: {
        DOMAIN_NAME: CONFIG.DOMAIN_NAME
      },
      restart: 'always',
      labels: [
        'traefik.enable=true',
        `traefik.http.routers.${serviceName}.rule=Host(\`${domainName}.${CONFIG.DOMAIN_NAME}\`)`,
        `traefik.http.routers.${serviceName}.service=${serviceName}`,
        `traefik.http.services.${serviceName}.loadbalancer.server.port=80`
      ]
    }
    return newConfig
  }

  async genDomainName(project: NProject.Item) {
    switch (project.stage) {
      case 'uat': {
        const branchInfo = await this.git.branch()
        const currentBranch = branchInfo.branches[branchInfo.current]
        return `${project.subdomainStatic}-${currentBranch.name.replace('/', '-')}-${
          currentBranch.commit
        }-${genRandomLowercaseString(3)}`.toLowerCase()
      }
      case 'prod':
        return project.subdomainStatic.toLowerCase()
      default:
        throw new Error('Invalid stage')
    }
  }

  async run(projectId: NProject.Item['id']) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId }
    })
    if (!project) throw new Error('project not found')
    console.log('project info', project)
    console.log(`current work dir: ${shelljs.pwd().toString()}`)

    const workDir = project.dirName
      ? path.join(getGitWorkDIR(), project.dirName, project.subWorkDir || '')
      : path.join(project.repoPath, project.subWorkDir || '')
    try {
      safeCD(workDir)
    } catch (err) {
      throw new Error('项目的 subWorkDir 有误')
    }
    this.git.cwd(workDir)
    console.log(`current work dir: ${shelljs.pwd().toString()}`)
    const rs = genRandomLowercaseString()

    let actualDomain

    switch (project.runMode) {
      case RunMode.dockerfile: {
        if (!fs.existsSync('Dockerfile')) throw new Error('Dockerfile 文件不存在')
        const serviceName = `${project.appName}-${rs}`
        console.log('serviceName', serviceName)
        const domainName = await this.genDomainName(project)
        console.log('domainName', domainName)
        actualDomain = `${domainName}.${CONFIG.DOMAIN_NAME}`
        if (project.stage === 'prod') {
          const pr = await this.prisma.projectRuntime.findUnique({
            where: {
              domain: actualDomain
            }
          })
          if (pr && pr.dockerComposeName && rmDockerComposeContainer(pr.dockerComposeName)) {
            throw new Error('生产环境下删除旧的容器失败')
          }
        }
        const config = this.genDockerComposeConfig(serviceName, domainName)
        fs.writeFileSync('./docker-compose.yaml', stringify(config))
        shelljs.exec(`docker-compose --project-name ${domainName} up --build -d`)
        if (shelljs.error()) {
          throw new Error('Failed to start app on dockerfile mode')
        }
        // 生成 runtime 记录
        await this.prisma.projectRuntime.create({
          data: {
            runMode: 'dockerfile',
            domain: actualDomain,
            dockerComposeName: domainName,
            project: {
              connect: { id: project.id }
            },
            user: {
              connect: { id: project.userId }
            }
          }
        })
        break
      }
      case RunMode.detect: {
        const localFileSystem = new LocalFileSystemDetector(shelljs.pwd().toString())
        const framework = await detectFramework({ fs: localFileSystem, frameworkList })
        console.log(framework)
        const pkg = await readJSON('package.json')
        const builder = await detectBuilders([], pkg)
        console.log(builder)
        break
      }
      default:
        throw new Error('Invalid runMode')
    }
    return {
      actualDomain
    }
  }
}

export default Core
