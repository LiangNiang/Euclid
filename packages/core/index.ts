import dotenv from 'dotenv'
import Core from './src/core'
import { MOCK_PROJECT_1, MOCK_USER } from './src/mock'

dotenv.config()
;(async () => {
  const c = new Core()
  const ids = await c.clone({
    project: MOCK_PROJECT_1,
    user: MOCK_USER
  })
  if (ids) {
    c.run(ids[0])
  }
})()

export { Core }
