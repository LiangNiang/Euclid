import dotenv from 'dotenv'
import Core from './src/core'
import { MOCK_PROJECT_1, MOCK_PROJECT_2, MOCK_USER } from './src/mock'

dotenv.config()

const c = new Core()
// c.clone({
//   project: MOCK_PROJECT_1,
//   user: MOCK_USER
// })
// c.run(2)

export { Core }
