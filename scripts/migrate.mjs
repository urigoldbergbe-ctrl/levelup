import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptcXBodndpdm1kcWZzbWhkcWhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM4MDY0NiwiZXhwIjoyMDkwOTU2NjQ2fQ.wNVEKEGbbUd5dqooZB6P-D2drFkSfcWgyd5wTvOb40Q'
const PROJECT = 'zmqphvwivmdqfsmhdqhm'

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
