import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function requiredEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

const SERVICE_KEY = requiredEnv('SUPABASE_SERVICE_ROLE_KEY')
const PROJECT = requiredEnv('SUPABASE_PROJECT_REF')

function post(urlPath, bodyObj) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(bodyObj)
    const req = https.request({
      hostname: `${PROJECT}.supabase.co`,
      port: 443,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      }
    }, (res) => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => resolve({ status: res.statusCode, body: d }))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// Try a few Supabase SQL execution endpoints
async function tryEndpoints() {
  const endpoints = [
    '/pg/query',
    '/rest/v1/rpc/query',
  ]
  for (const ep of endpoints) {
    const r = await post(ep, { query: 'SELECT 1 as ok' })
    console.log(`${ep} → ${r.status}: ${r.body.slice(0, 100)}`)
  }
}

await tryEndpoints()
