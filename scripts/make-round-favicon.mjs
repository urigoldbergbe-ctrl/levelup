import { readFileSync, writeFileSync } from 'fs'

const data = readFileSync('public/logo.png')
const b64 = 'data:image/png;base64,' + data.toString('base64')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <clipPath id="c">
      <circle cx="50" cy="50" r="50"/>
    </clipPath>
  </defs>
  <image href="${b64}" width="100" height="100" clip-path="url(#c)"/>
</svg>`

writeFileSync('public/favicon.svg', svg)
console.log('favicon.svg written, size:', svg.length)
