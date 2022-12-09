import shelljs from 'shelljs'
import Docker from 'dockerode'

export function initDockerInstance() {
  return new Docker({ socketPath: '/var/run/docker.sock' })
}

export function rmDockerComposeContainer(name: string) {
  shelljs.exec(`docker-compose --project-name ${name} down --rmi all`)
  return shelljs.error()
}
