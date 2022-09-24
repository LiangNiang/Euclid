declare namespace NodeJS {
  interface ProcessEnv {
    ACCESS_TOKEN: string
  }
}

type UserInfo = {
  username: string
}

type ProjectInfo  = {
  repoPath: string
  branch: string
}
