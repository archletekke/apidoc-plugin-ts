import { expect } from 'chai'
import 'mocha'
import * as apidoc from 'apidoc'
import * as fs from 'fs-extra'
import * as path from 'path'
const tests = [
  {
    only: false,
    name: 'test1'
  },
  {
    skip: true,
    name: 'array-with-type-aliases'
  },
  {
    name: 'array-in-types'
  },
  {
    only: false,
    name: 'native-types'
  },
  {
    only: false,
    name: 'array-as-properties'
  },
  {
    only: false,
    name: 'namespaces'
  },
  {
    only: false,
    name: 'enum-as-properties'
  }
]
describe('Apidoc TS Plugin', () => {
  tests.forEach(function (test) {
    (test.only ? it.only : (test.skip ? it.skip : it))(test.name, async function () {
      // give the test a bit more time since it seems to take more than 2 sec
      this.timeout(10000)

      const dest = `out/${test.name}`
      apidoc.createDoc({
        src: `${test.name}`,
        debug: false,
        dest
      })
      const outputJson = await fs.readJson(path.join('out', test.name, 'api_data.json'))
      const expectedJson = await fs.readJson(path.join(test.name, 'fixture.json'))
      expect(outputJson).to.deep.equal(expectedJson)
    })
  })
})
