/* eslint-env jest */

import { join } from 'path'
import webdriver from 'next-webdriver'
import {
  killApp,
  findPort,
  nextStart,
  nextBuild,
  launchApp,
  renderViaHTTP,
} from 'next-test-utils'

const appDir = join(__dirname, '../app')
const nodeArgs = ['-r', join(appDir, '../../../lib/react-17-require-hook.js')]
let appPort
let app

function runTests() {
  it('should render styles during CSR', async () => {
    const browser = await webdriver(appPort, '/')
    const color = await browser.eval(
      `getComputedStyle(document.querySelector('button')).color`
    )

    expect(color).toMatch('0, 255, 255')
  })

  it('should render styles during CSR (AMP)', async () => {
    const browser = await webdriver(appPort, '/amp')
    const color = await browser.eval(
      `getComputedStyle(document.querySelector('button')).color`
    )

    expect(color).toMatch('0, 255, 255')
  })

  it('should render styles during SSR', async () => {
    const html = await renderViaHTTP(appPort, '/')
    expect(html).toMatch(/color:.*?cyan/)
  })

  it('should render styles during SSR (AMP)', async () => {
    const html = await renderViaHTTP(appPort, '/amp')
    expect(html).toMatch(/color:.*?cyan/)
  })
}

describe('styled-jsx using in node_modules', () => {
  describe('Production', () => {
    beforeAll(async () => {
      await nextBuild(appDir, undefined, {
        nodeArgs,
      })
      appPort = await findPort()
      app = await nextStart(appDir, appPort, {
        nodeArgs,
      })
    })
    afterAll(() => killApp(app))

    runTests()
  })

  describe('Development', () => {
    beforeAll(async () => {
      appPort = await findPort()
      app = await launchApp(appDir, appPort, {
        nodeArgs,
      })
    })
    afterAll(() => killApp(app))

    runTests()
  })
})
