import shelljs from 'shelljs'
import Docker from 'dockerode'

export function initDockerInstance() {
  return new Docker({ socketPath: '/var/run/docker.sock' })
}

export function rmDockerComposeContainer(name: string) {
  return shelljs.exec(`docker-compose --project-name ${name} down`)
}
