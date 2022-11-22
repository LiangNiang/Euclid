declare namespace Project {
  interface Item {
    id: number
    repoPath: string
    branch: string
    dirName: string
    appName: string
    subdomain: string
  }

  type InputParam = Omit<Item, 'id' | 'dirName'>
}
