type Config = {
  project: NProject.InputParam
  user: NUser.InputParam
}

export const TEST_CONFIG_1: Config = {
  project: {
    repoPath: '/home/liangniang/euclid-tmp/vqervgqernvhqe',
    branch: 'main',
    subdomainStatic: 'euclid',
    subWorkDir: 'packages/web',
    appName: 'euclid-web',
    buildPath: 'dist',
    stage: 'uat',
    runMode: 'dockerfile'
  },
  user: {
    username: 'LiangNiang'
  }
}

export const TEST_CONFIG_2: Config = {
  project: {
    repoPath: 'remoteremote',
    branch: 'main',
    subdomainStatic: 'euclid',
    subWorkDir: 'packages/web',
    appName: 'euclid-web',
    buildPath: 'dist',
    stage: 'uat',
    runMode: 'dockerfile'
  },
  user: {
    username: 'LiangNiang'
  }
}

export const TEST_CONFIG_3: Config = {
  project: {
    repoPath: 'https://aaa.aaa.com/',
    branch: 'main',
    subdomainStatic: 'euclid',
    subWorkDir: 'packages/web',
    appName: 'euclid-web',
    buildPath: 'dist',
    stage: 'uat',
    runMode: 'dockerfile'
  },
  user: {
    username: 'LiangNiang'
  }
}
