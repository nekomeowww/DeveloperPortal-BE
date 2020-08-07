// Dependencies
const KoaRouter = require('koa-router')

// Local Package
const { app, newApp, getAppDetail, getAppIcon, getAppSecret, removeApp, postAuthorize, postPermission, getPermission, getAuthorize } = require('../controllers/app')

const AppRouter = new KoaRouter

AppRouter.get("/", app)
AppRouter.post("/authorize", postAuthorize)
AppRouter.get("/authorize", getAuthorize)
AppRouter.post("/permission", postPermission)
AppRouter.get("/permission", getPermission)
AppRouter.get("/detail", getAppDetail)
AppRouter.get("/secret", getAppSecret)
AppRouter.post("/new", newApp)
AppRouter.get("/remove", removeApp)
AppRouter.get("/appIcon", getAppIcon)

module.exports = AppRouter