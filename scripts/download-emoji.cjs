/**
 * 从项目源码中提取所有 Emoji，下载对应的 twemoji PNG 到 public/ 目录
 * 这样图片从应用同域名加载，微信不会拦截
 */
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

// 所有源文件
const srcDir = path.resolve(__dirname, '../src')
const publicDir = path.resolve(__dirname, '../public/twemoji/72x72')

// Emoji 正则：匹配 Unicode Emoji 字符
// 匹配大部分 emoji（包括 ZWJ 序列和修饰符）
const EMOJI_RE = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2934}\u{2935}\u{25AA}\u{25AB}\u{25FB}-\u{25FE}\u{2B1B}-\u{2B1C}\u{2702}-\u{27B0}\u{24C2}\u{3297}\u{3299}\u{00A9}\u{00AE}\u{2122}\u{3030}\u{303D}\u{200D}\u{FE0F}]|(?:\u{1F3FB}|\u{1F3FC}|\u{1F3FD}|\u{1F3FE}|\u{1F3FF})/gu

// 扫描文件获取所有 emoji
function scanEmojis(dir) {
  const emojis = new Set()
  const files = fs.readdirSync(dir, { recursive: true })
  for (const file of files) {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isFile() && /\.(vue|js|ts|html)$/.test(file)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const matches = content.match(EMOJI_RE)
      if (matches) {
        matches.forEach(e => emojis.add(e))
      }
    }
  }
  return [...emojis]
}

// Emoji 字符 → twemoji 文件名（十六进制 codepoint，下划线连接）
function emojiToFilename(emoji) {
  const codes = []
  for (const ch of emoji) {
    codes.push(ch.codePointAt(0).toString(16))
  }
  return codes.join('-')
}

// 下载文件
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const client = url.startsWith('https') ? https : http
    client.get(url, { rejectUnauthorized: false }, (res) => {
      // 处理重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close()
        fs.unlinkSync(dest)
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        file.close()
        fs.unlinkSync(dest)
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      }
      res.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      file.close()
      if (fs.existsSync(dest)) fs.unlinkSync(dest)
      reject(err)
    })
  })
}

async function main() {
  console.log('🔍 扫描源文件中的 Emoji...')
  const emojis = scanEmojis(srcDir)
  console.log(`找到 ${emojis.length} 个不同的 Emoji`)

  // 创建目录
  fs.mkdirSync(publicDir, { recursive: true })

  // 下载源：BootCDN（国内可达，且图片路径已验证正确）
  const baseCDN = 'https://cdn.bootcdn.net/ajax/libs/twemoji/14.0.2/72x72'

  let success = 0
  let fail = 0
  const failedEmojis = []

  for (const emoji of emojis) {
    const filename = emojiToFilename(emoji) + '.png'
    const destPath = path.join(publicDir, filename)

    if (fs.existsSync(destPath)) {
      success++
      continue
    }

    const url = `${baseCDN}/${filename}`
    try {
      await downloadFile(url, destPath)
      success++
      process.stdout.write('✅')
    } catch (err) {
      fail++
      failedEmojis.push(emoji + ' → ' + filename)
      process.stdout.write('❌')
    }
  }

  console.log('\n')
  console.log(`📊 结果：成功 ${success}，失败 ${fail}`)

  // 输出失败的 emoji
  const files = fs.readdirSync(publicDir)
  console.log(`📁 public/twemoji/72x72/ 中共 ${files.length} 个文件`)

  // 生成 Emoji 映射表，方便查看
  const mapPath = path.resolve(__dirname, '../public/twemoji/emoji-map.json')
  const map = {}
  for (const emoji of emojis) {
    map[emoji] = emojiToFilename(emoji) + '.png'
  }
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2))
  console.log(`📝 Emoji 映射表已生成: public/twemoji/emoji-map.json`)
}

main().catch(console.error)
