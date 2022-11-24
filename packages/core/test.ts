import Core from './src/core'
import { MOCK_PROJECT_4, MOCK_USER } from './src/mock'
;(async () => {
  const c = new Core()
  const ids = await c.clone({
    project: MOCK_PROJECT_4,
    user: MOCK_USER
  })
  if (ids) {
    c.run(ids[0])
  }
})()
