// One-off screenshot capture for HelperIQ docs.
// Run against the local staging instance at http://localhost:9001 with
// the demo seeder data:
//
//   node scripts/capture-screenshots.mjs
//
// Outputs to public/images/. Captures shots of the main areas the
// docs talk about so we can illustrate the feature/REST pages.

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const ROOT = resolve(dirname(__filename), '..')
const OUT = resolve(ROOT, 'public/images')

const BASE = process.env.HELPERIQ_URL || 'http://localhost:9001'
const EMAIL = process.env.HELPERIQ_EMAIL || 'admin@demo.local'
const PASSWORD = process.env.HELPERIQ_PASSWORD || 'DemoPassw0rd!'

async function main () {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  // Login.
  await page.goto(`${BASE}/`)
  await page.getByRole('textbox', { name: 'Email' }).fill(EMAIL)
  await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL(/inboxes/)
  await page.waitForLoadState('networkidle')

  const shoot = async (name, opts = {}) => {
    const path = resolve(OUT, `${name}.png`)
    await page.screenshot({ path, fullPage: opts.fullPage === true })
    console.log(`  ✓ ${name}.png`)
  }

  // 1. Conversation list — landing hero. Switch to table view first (the
  // wider layout reads better as a screenshot than the narrow split view).
  await page.goto(`${BASE}/inboxes/all`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
  // Try clicking the table-view toggle button if present.
  try {
    const tableViewBtn = page.getByRole('button', { name: /table view/i }).first()
    if (await tableViewBtn.count() > 0) {
      await tableViewBtn.click()
      await page.waitForTimeout(500)
    }
  } catch {}
  await shoot('conversation-list')

  // 2. Conversation detail — click into the first ticket in the list.
  // The list rows aren't a single <a>; click the row's contact-name cell.
  const firstRow = page.locator('[class*="conversation-list-item"], tr[role="button"], tr.cursor-pointer, [data-testid="conversation-row"]').first()
  if (await firstRow.count() > 0) {
    await firstRow.click()
  } else {
    // Fallback: click the first visible row that contains a reference number.
    const refRow = page.locator('text=/#\\d+/').first()
    if (await refRow.count() > 0) await refRow.click()
  }
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  await shoot('conversation-detail')

  // 3. AI Settings.
  await page.goto(`${BASE}/admin/ai`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
  await shoot('ai-settings')

  // 4. Knowledge sources (RAG).
  await page.goto(`${BASE}/admin/knowledge-sources`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
  await shoot('knowledge-sources')

  // 5. Ecommerce settings.
  await page.goto(`${BASE}/admin/ecommerce`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
  await shoot('ecommerce-settings')

  // 6. Inboxes admin.
  await page.goto(`${BASE}/admin/inboxes`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
  await shoot('inboxes-admin')

  // 7. Macros admin (path is /admin/conversations/macros in v2.1.1).
  await page.goto(`${BASE}/admin/conversations/macros`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
  await shoot('macros-admin')

  await browser.close()
  console.log(`\nDone. ${OUT}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
