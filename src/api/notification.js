const KoaRouter = require('koa-router')

const { notifyUpdate, notifyNew, notifyPush } = require('../controllers/notification')

let notificationRouter = new KoaRouter()

notificationRouter.get("/update", notifyUpdate)
notificationRouter.get("/push", notifyPush)
notificationRouter.get("/new", notifyNew)

module.exports = notificationRouter