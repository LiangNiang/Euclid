import { cd, error } from 'shelljs'

export function safeCD(...args: Parameters<typeof cd>) {
  cd(...args)
  if (error()) {
    throw new Error('cd fail')
  }
}
