import Core from './src/core'

const c = new Core()

console.log(await c.docker.listContainers())
