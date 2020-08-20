const KoaRouter = require('koa-router')

let routers = new KoaRouter()

let app = require('../api/app')
let img = require('../api/img')
let user = require('../api/user')
let team = require('../api/team')
let login = require('../api/login')
let invite = require('../api/invite')
let notification = require('../api/notification')

routers.use("/app", app.routes(), app.allowedMethods())
routers.use("/login", login.routes(), login.allowedMethods())
routers.use("/invite", invite.routes(), invite.allowedMethods())
routers.use("/user", user.routes(), user.allowedMethods())
routers.use("/team", team.routes(), team.allowedMethods())
routers.use("/img", img.routes(), img.allowedMethods())
routers.use("/notification", notification.routes(), notification.allowedMethods())

module.exports = routers