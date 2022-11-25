import { customAlphabet } from 'nanoid'

export function genRandomLowercaseString(length = 12) {
  return customAlphabet('abcdefghijklmnopqrstuvwxyz', length)()
}
