const KoaRouter = require('koa-router')

let routers = new KoaRouter()

let app = require('../api/app')
let img = require('../api/img')
let user = require('../api/user')
let team = require('../api/team')
let login = require('../api/login')

routers.use("/app", app.routes(), app.allowedMethods())
routers.use("/login", login.routes(), login.allowedMethods())
routers.use("/user", user.routes(), user.allowedMethods())
routers.use("/team", team.routes(), team.allowedMethods())
routers.use("/img", img.routes(), img.allowedMethods())

module.exports = routers