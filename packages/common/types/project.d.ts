declare namespace NProject {
  type Item = import('@prisma/client').Project

  type InputParam = Pick<
    Item,
    | 'repoPath'
    | 'appName'
    | 'branch'
    | 'subdomainStatic'
    | 'buildPath'
    | 'stage'
    | 'runMode'
    | 'subWorkDir'
  >
}
