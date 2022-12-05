import { SimpleGit } from 'simple-git'
import path from 'node:path'
import fs from 'node:fs'
import { pwd, exec } from 'shelljs'
import { initDBInstance } from './db'
import { cloneRemoteRepoToLocal, getGitWorkDIR, initGitInstance } from './git'
import { genRandomLowercaseString } from './utils'
import defaultDockerComposeConfig from './default-docker-compose.json'
import { stringify } from 'yaml'
import isURL from 'is-url'
import { safeCD } from './shellWrapper'
import { rmDockerComposeContainer } from './docker'
import { PrismaClient, Project } from '@prisma/client'

class Core {
  git: SimpleGit
  prisma!: InstanceType<typeof PrismaClient>

  constructor() {
    this.git = initGitInstance()
    this.prisma = initDBInstance()
  }

  async clone(config: { project: Project.InputParam; user: User.InputParam }) {
    const { project, user } = config
    const { repoPath } = project
    if (isURL(repoPath)) {
      // remote repo
      let dirName
      try {
        console.error('Project clone start')
        dirName = await cloneRemoteRepoToLocal(this.git, project, user)
        const res = await this.prisma.project.create({
          data: {
            ...project,
            dirName,
            user: {
              connect: { username: user.username }
            }
          }
        })
        return res.id
        console.error('Project clone success')
      } catch (err) {
        console.error('Project clone error')
        return
      }
    } else {
      const res = await this.prisma.project.create({
        data: {
          ...project,
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
        DOMAIN_NAME: process.env.DOMAIN_NAME
      },
      restart: 'always',
      labels: [
        'traefik.enable=true',
        `traefik.http.routers.${serviceName}.rule=Host(\`${domainName}.\${DOMAIN_NAME}\`)`,
        `traefik.http.routers.${serviceName}.service=${serviceName}`,
        `traefik.http.services.${serviceName}.loadbalancer.server.port=80`
      ]
    }
    return newConfig
  }

  async genDomainName(project: Project) {
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
        return ''
    }
  }

  async run(projectID: Project.DB['id']) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectID }
    })
    if (!project) throw new Error('project not found')
    console.log('project info', project)
    console.log(`current work dir: ${pwd().toString()}`)

    const workDir = project.dirName
      ? path.join(getGitWorkDIR(), project.dirName, project.subWorkDir || '')
      : project.repoPath
    try {
      safeCD(workDir)
    } catch (err) {
      throw new Error('项目的 subWorkDir 有误')
    }
    this.git.cwd(workDir)
    console.log(`current work dir: ${pwd().toString()}`)
    const rs = genRandomLowercaseString()

    let actualDomain

    switch (project.runMode) {
      case 'dockerfile': {
        if (!fs.existsSync('Dockerfile')) throw new Error('Dockerfile 文件不存在')
        const serviceName = `${project.appName}-${rs}`
        console.log('serviceName', serviceName)
        const domainName = await this.genDomainName(project)
        console.log('domainName', domainName)
        if (project.stage === 'prod') {
          if (rmDockerComposeContainer(domainName).code !== 0) {
            throw new Error('生产环境下删除旧的容器失败')
          }
        }
        const config = this.genDockerComposeConfig(serviceName, domainName)
        fs.writeFileSync('./docker-compose.yaml', stringify(config))
        if (exec(`docker-compose --project-name ${domainName} up --build -d`).code !== 0) {
          throw new Error('Failed to start app on dockerfile mode')
        }
        actualDomain = `${domainName}.${process.env.DOMAIN_NAME}`
        break
      }
      case 'pure': {
        break
      }
      default:
        break
    }
    return {
      actualDomain
    }
  }
}

export default Core
