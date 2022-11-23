import { Knex } from 'knex'
import { SimpleGit } from 'simple-git'
import path from 'node:path'
import fs from 'node:fs'
import { pwd, cd, exec, set } from 'shelljs'
import { initDB, initDBInstance } from './db'
import { cloneRemoteRepoToLocal, getGitWorkDIR, initGitInstance } from './git'
import { genRandomLowercaseString } from './utils'
import defaultDockerComposeConfig from './default-docker-compose.json'
import { stringify } from 'yaml'

class Core {
  git: SimpleGit
  db: Knex
  Projects: Knex.QueryBuilder<Project.DB, Project.DB[]>

  constructor() {
    this.git = initGitInstance()
    this.db = initDBInstance()
    initDB(this.db)
    this.Projects = this.db<Project.DB>('projects')
  }

  async clone(config: { project: Project.InputParam; user: User.InputParam }) {
    const { project, user } = config
    await cloneRemoteRepoToLocal(this.git, project, user)
      .then(async dirName => {
        await this.Projects.insert({
          ...project,
          dirName
        })
      })
      .catch(err => {
        console.error(err)
      })
  }

  genDockerComposeConfig(serviceName: string, domainName: string) {
    const newConfig = { ...defaultDockerComposeConfig }
    // @ts-ignore
    newConfig.services[serviceName] = {
      image: serviceName,
      container_name: serviceName,
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

  async genDomainName(project: Project.DB) {
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
    const project = await this.Projects.where('id', projectID).first()
    if (!project) throw new Error('project not found')
    console.log('project info', project)
    console.log(`current work dir: ${pwd().toString()}`)
    const workDir = path.join(getGitWorkDIR(), project.dirName, project.subWorkDir || '')
    cd(workDir)
    this.git.cwd(workDir)
    console.log(`current work dir: ${pwd().toString()}`)
    const rs = genRandomLowercaseString()

    switch (project.runMode) {
      case 'dockerfile': {
        const serviceName = `${project.appName}-${rs}`
        console.log('serviceName', serviceName)
        exec(`export COMPOSE_PROJECT_NAME=${serviceName}`)
        const domainName = await this.genDomainName(project)
        console.log('domainName', domainName)
        const config = await this.genDockerComposeConfig(serviceName, domainName)
        fs.writeFileSync('./docker-compose.yaml', stringify(config))
        console.log('** build docker image start **')
        exec(`docker build -t ${serviceName} .`)
        exec(`docker-compose --project-name ${domainName} up -d`)
        break
      }
      default:
        break
    }
  }
}

export default Core
