import { test, expect, describe } from 'vitest'

import { genRandomLowercaseString } from '../src/utils'

describe.concurrent('genRandomLowercaseString', () => {
  test('无参数', () => {
    const t = genRandomLowercaseString()
    expect(t).toHaveLength(12)
  })

  test('有参数', () => {
    const t = genRandomLowercaseString(10)
    expect(t).toHaveLength(10)
  })
})
