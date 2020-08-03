// Dependencies
const KoaRouter = require('koa-router')

// Local Package
const { app, newApp, getAppIcon } = require('../controllers/app')

const AppRouter = new KoaRouter

AppRouter.get("/", app)
AppRouter.post("/new", newApp)
AppRouter.get("/appIcon", getAppIcon)




module.exports = AppRouter