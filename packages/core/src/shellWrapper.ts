import shelljs from 'shelljs'

export function safeCD(...args: Parameters<typeof shelljs.cd>) {
  shelljs.cd(...args)
  if (shelljs.error()) {
    throw new Error('cd fail')
  }
}
