import { describe, expect, test } from 'vitest'
import { nanoid } from 'nanoid'

import { rmDockerComposeContainer } from '../src/docker'

describe('docker module test', () => {
  test('rmDockerComposeContainer', () => {
    const n = nanoid()
    const res = rmDockerComposeContainer(n)
    expect(res).toMatchInlineSnapshot(`
      "exec: \\"${n}\\" is not a valid project name
      "
    `)
  })
})
