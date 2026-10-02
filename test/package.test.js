import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

test('the CommonJS package entry exposes the plugin and DatePicker', () => {
  const packageExports = require('..')

  assert.equal(typeof packageExports.default.install, 'function')
  assert.ok(packageExports.DatePicker)
})
