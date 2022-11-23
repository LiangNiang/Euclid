export const MOCK_PROJECT_1: Project.InputParam = {
  repoPath: 'https://github.com/LiangNiang/Euclid.git',
  branch: 'WIP/mvp-demo',
  subdomainStatic: 'euclid',
  subWorkDir: 'packages/web',
  appName: 'euclid-web',
  buildPath: 'dist',
  stage: 'uat' as Project.Stage,
  runMode: 'dockerfile' as Project.RunMode
}

export const MOCK_PROJECT_2: Project.InputParam = {
  repoPath: 'https://github.com/LiangNiang/Euclid.git',
  branch: 'WIP/mvp-demo',
  subdomainStatic: 'euclid',
  subWorkDir: 'packages/web',
  appName: 'euclid-web',
  buildPath: 'dist',
  stage: 'prod' as Project.Stage,
  runMode: 'dockerfile' as Project.RunMode
}

/**
 * error
 */
export const MOCK_PROJECT_3: Project.InputParam = {
  repoPath: 'https://github.com/LiangNiang/Euclid.git',
  branch: 'main',
  subdomainStatic: 'euclid',
  appName: 'euclid-web',
  buildPath: 'dist',
  stage: 'prod' as Project.Stage,
  runMode: 'dockerfile' as Project.RunMode
}

export const MOCK_USER: User.InputParam = {
  username: 'LiangNiang'
}
