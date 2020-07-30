// Dependencies
const Koa = require('koa')
const KoaStatic = require('koa-static')

let app = new Koa()
app.proxy = true

app.use(KoaStatic('./public'))

app.listen(7201)