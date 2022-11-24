import { exec } from 'shelljs'

export function rmDockerComposeContainer(name: string) {
  return exec(`docker-compose --project-name ${name} down`)
}
