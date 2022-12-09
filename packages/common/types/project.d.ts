declare namespace Project {
  enum Stage {
    uat = 'uat',
    pre = 'pre',
    prod = 'prod'
  }

  enum RunMode {
    dockerfile = 'dockerfile',
    detect = 'detect'
  }

  interface Item {
    id: string
    repoPath: string
    branch: string
    /**
     * 随机生成的工作目录
     */
    dirName: string
    /**
     * 基于工作目录的二级目录，用来支持 monorepo，实际的目录为 `dirName/subWorkDir`
     */
    subWorkDir?: string
    appName: string
    /**
     * 二级域名的静态部份
     */
    subdomainStatic: string
    /**
     * 构建产物的目录，实际的目录为 `dirName/subWorkDir/buildDir`
     */
    buildPath: string
    stage: Stage
    runMode: RunMode
  }

  type InputParam = Omit<Item, 'id' | 'dirName'>
  type DB = Item & DB_PARAMS
}
