// Dependencies
const Koa = require('koa')
const KoaStatic = require('koa-static')

// Local Packages
const Log = require('./src/util/log')
const config = require('./config.json')

let app = new Koa()
app.proxy = true

app.use(KoaStatic('./public'))

if (config === undefined) {
    let err = new Error('请先根据 config.json.example 创建 config.json 文件')
    err.name = 'Configuration Error'
    throw err
}

app.listen(config.port)
Log.info("App 已经开始运行在 http://127.0.0.1:" + config.port)